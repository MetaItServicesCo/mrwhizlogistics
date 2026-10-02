"""
Agent nodes. Each specialist streams its reply to the visitor through the
LangGraph stream writer ({"type": "token"} events) and returns the final text
in state, where the output guard can still replace it.

Runtime dependencies come from the run config ("configurable"):
  session_id, site (ChatbotConfig), llm (ChatLLM), kb (KnowledgeBase), leads (BackendClient)
"""

import logging
import re

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.config import get_stream_writer

from app.agent import lead as lead_rules
from app.agent import prompts
from app.agent.guards import check_input, check_output
from app.agent.llm import _DECLINE, FakeLLM, LeadExtraction, LLMUnavailable, RouteDecision
from app.agent.state import ChatState
from app.config import get_settings
from app.knowledge.base import public_link
from app.knowledge.retriever import confident

log = logging.getLogger(__name__)
settings = get_settings()

_QUICK_YES = re.compile(r"^\s*(yes|yeah|yep|yup|correct|right|sure|ok|okay|confirm(ed)?|that'?s (right|correct)|call me( now)?|please( do)?|s[ií]|claro)\b[\s!.]*$", re.I)
_QUICK_NO = re.compile(r"^\s*(no|nope|wrong|incorrect|change( (it|details|number|name))?|not right)\b[\s!.]*$", re.I)
_regex_fallback = FakeLLM()


# --------------------------------------------------------------------------- helpers


def _deps(config: RunnableConfig) -> dict:
    return config.get("configurable", {})


def _emit(event: dict) -> None:
    try:
        get_stream_writer()(event)
    except Exception:  # noqa: BLE001 - not streaming (e.g. invoke in tests)
        pass


def _latest_user_text(state: ChatState) -> str:
    for m in reversed(state.get("messages", [])):
        if isinstance(m, HumanMessage):
            return str(m.content)
    return ""


def _last_assistant_text(state: ChatState) -> str:
    for m in reversed(state.get("messages", [])):
        if isinstance(m, AIMessage):
            return str(m.content)
    return ""


def _history(state: ChatState) -> list[BaseMessage]:
    msgs = [m for m in state.get("messages", []) if isinstance(m, (HumanMessage, AIMessage))]
    return msgs[-settings.history_turns * 2 :]


async def _stream_reply(llm, system: str, history: list[BaseMessage], fallback: str) -> str:
    """Stream tokens to the visitor; on total model failure send the fallback text."""
    parts: list[str] = []
    try:
        async for piece in llm.stream(system, history, fallback=fallback):
            parts.append(piece)
            _emit({"type": "token", "text": piece})
    except LLMUnavailable:
        parts = [fallback]
        _emit({"type": "token", "text": fallback})
    return "".join(parts).strip()


def _collected_text(lead: dict) -> str:
    lines = lead_rules.summary_lines(lead)
    return "\n".join(f"- {label}: {value}" for label, value in lines) or "(nothing yet)"


def _lead_hint(state: ChatState) -> str:
    if state.get("lead_stage") in ("collecting", "confirming"):
        missing = lead_rules.missing_required(state.get("lead", {}))
        if missing:
            need = " and ".join("name" if f == "name" else "phone number" for f in missing)
            return f"After answering, add one short sentence reminding the visitor you still need their {need} so a dispatcher can call them."
        return "After answering, ask in one short sentence whether they'd like the dispatcher to call them now."
    return ""


# --------------------------------------------------------------------------- input guard


async def guard_input(state: ChatState, config: RunnableConfig) -> dict:
    reset = {"reply": "", "sources": [], "suggestions": [], "blocked": False, "flagged": False, "flag_reason": None, "intent": "", "search_query": ""}
    check = check_input(_latest_user_text(state), settings.max_message_chars)
    if check.ok:
        return reset
    site = _deps(config)["site"]
    reply = (
        f"I can only help with {site.company_name}'s freight services and quotes. "
        "What would you like to ship, or what can I tell you about our services?"
    )
    _emit({"type": "token", "text": reply})
    return reset | {"blocked": True, "reply": reply, "flagged": True, "flag_reason": f"input_{check.reason}", "intent": "blocked"}


def after_input(state: ChatState) -> str:
    return "finalize" if state.get("blocked") else "router"


# --------------------------------------------------------------------------- orchestrator


async def router(state: ChatState, config: RunnableConfig) -> dict:
    deps = _deps(config)
    text = _latest_user_text(state)
    stage = state.get("lead_stage", "none")

    # Answering the confirmation question needs no model call.
    if stage == "confirming" and (_QUICK_YES.match(text) or _QUICK_NO.match(text)):
        return {"intent": "lead", "search_query": text}
    # Turning down the call-back offer ends the lead flow (handled by the lead agent).
    if stage == "collecting" and _DECLINE.search(text) and len(text) < 60:
        return {"intent": "lead", "search_query": text}

    lead = state.get("lead", {})
    if stage in ("collecting", "confirming"):
        missing = lead_rules.missing_required(lead)
        lead_state = (
            "LEAD FLOW: ACTIVE. The assistant is collecting callback details"
            + (f" (still missing: {', '.join(missing)})." if missing else " and asked the visitor to confirm them.")
            + " Messages that provide details, answer the assistant or decline the call are 'lead'; a clear new question is 'knowledge'."
        )
    elif stage == "submitted":
        lead_state = "LEAD FLOW: SUBMITTED. A dispatcher will call the visitor; extra shipment details they share are 'lead'."
    else:
        lead_state = "LEAD FLOW: NOT STARTED."
    system = prompts.ROUTER.format(lead_state=lead_state, last_assistant=_last_assistant_text(state)[:400].replace('"', "'"))
    try:
        decision: RouteDecision = await deps["llm"].route(system, _history(state))
    except LLMUnavailable as exc:
        log.warning("Router unavailable, using fallback routing: %s", exc)
        decision = await _regex_fallback.route(system, _history(state))
    return {
        "intent": decision.intent,
        "search_query": (decision.search_query or text)[:300],
        "language": (decision.language or state.get("language") or "en")[:8],
    }


def route_intent(state: ChatState) -> str:
    intent = state.get("intent")
    if intent in ("lead", "handoff"):
        return "lead"
    if intent in ("smalltalk", "off_topic"):
        return "conversation"
    return "knowledge"


# --------------------------------------------------------------------------- knowledge agent

UNSUPPORTED_CLAIM_REPLY = (
    "I don't want to give you a wrong figure: pricing and transit times depend on your load, route and "
    "timing, so a dispatcher confirms them. Would you like a call back? Just share your name and phone number."
)


async def knowledge(state: ChatState, config: RunnableConfig) -> dict:
    deps = _deps(config)
    site, llm, kb = deps["site"], deps["llm"], deps["kb"]
    language = state.get("language", "en")
    query = state.get("search_query") or _latest_user_text(state)
    hits = await kb.search(query)
    pv = prompts.persona_vars(site, language)
    lead_hint = _lead_hint(state)
    suggestions = [] if state.get("lead_stage") == "submitted" else ["Request a call back"]

    if not confident(hits, settings.kb_min_score):
        system = prompts.NO_ANSWER.format(**pv, lead_hint=lead_hint)
        fallback = f"I don't have that detail on hand. A dispatcher can help: share your name and phone number for a call back, or call {site.dispatch_phone}."
        reply = await _stream_reply(llm, system, _history(state), fallback)
        verdict = check_output(reply, site.company_facts())
        if not verdict.ok:
            reply = UNSUPPORTED_CLAIM_REPLY
            _emit({"type": "replace", "text": reply})
            return {"reply": reply, "sources": [], "suggestions": suggestions, "flagged": True, "flag_reason": verdict.reason}
        return {"reply": reply, "sources": [], "suggestions": suggestions}

    context = "\n\n".join(f"[{i + 1}] {h.chunk.content}" for i, h in enumerate(hits))
    system = prompts.KNOWLEDGE.format(**pv, lead_hint=lead_hint, company_facts=site.company_facts(), context=context)
    fallback = f"Sorry, I can't look that up right now. Please call dispatch at {site.dispatch_phone}, or leave your name and number for a call back."
    sources: list[dict] = []
    for h in hits:
        link = public_link(h.chunk.url)
        if link and link not in {s["url"] for s in sources} and h.dense >= settings.kb_min_score - 0.1:
            sources.append({"url": link, "title": h.chunk.title or link})
        if len(sources) == 3:
            break
    if sources:
        _emit({"type": "sources", "sources": sources})

    reply = await _stream_reply(llm, system, _history(state), fallback)
    verdict = check_output(reply, context + "\n" + site.company_facts())
    if not verdict.ok:
        log.info("Output guard replaced an answer (%s)", verdict.reason)
        reply = UNSUPPORTED_CLAIM_REPLY
        _emit({"type": "replace", "text": reply})
        return {"reply": reply, "sources": sources, "suggestions": ["Request a call back"], "flagged": True, "flag_reason": verdict.reason}
    return {"reply": reply, "sources": sources, "suggestions": suggestions}


# --------------------------------------------------------------------------- lead agent


def _ask_missing(lead: dict, handoff: bool, phone_problem: bool, dispatch_phone: str) -> tuple[str, str]:
    """(instruction for the model, fallback text) for the next collecting question."""
    missing = lead_rules.missing_required(lead)
    opener = ""
    if handoff:
        opener = f"Acknowledge they'd like to talk to a person: a dispatcher can call them right away, or they can call {dispatch_phone} now. Then "
    if phone_problem:
        return (
            opener + "say the phone number doesn't look complete and ask for the full number including area code.",
            "That phone number doesn't look complete. Could you send the full number, including the area code?",
        )
    if missing == ["name", "phone"]:
        return (
            opener + "ask for their name and the best phone number for the dispatcher to call.",
            ("Happy to connect you with a person. " if handoff else "")
            + "A dispatcher can call you right away. What's your name and the best phone number to reach you?",
        )
    if missing == ["phone"]:
        first = (lead.get("name") or "").split(" ")[0]
        return (
            opener + "ask for the best phone number for the dispatcher to call" + (f" (address them as {first})" if first else "") + ".",
            f"Thanks{', ' + first if first else ''}! What's the best phone number for our dispatcher to call?",
        )
    return (
        opener + "ask for their name so the dispatcher knows who to ask for.",
        "Thanks! And what name should the dispatcher ask for?",
    )


async def _compose(llm, site, state: ChatState, instruction: str, fallback: str, lead: dict) -> str:
    system = prompts.LEAD.format(**prompts.persona_vars(site, state.get("language", "en")), instruction=instruction, collected=_collected_text(lead))
    reply = await _stream_reply(llm, system, _history(state), fallback)
    if not check_output(reply, site.company_facts()).ok:
        reply = fallback
        _emit({"type": "replace", "text": reply})
    return reply


async def lead_agent(state: ChatState, config: RunnableConfig) -> dict:
    deps = _deps(config)
    site, llm, leads, session_id = deps["site"], deps["llm"], deps["leads"], deps["session_id"]
    stage = state.get("lead_stage") or "none"
    lead = dict(state.get("lead") or {})
    handoff = bool(state.get("handoff")) or state.get("intent") == "handoff"
    text = _latest_user_text(state)

    # 1) Extract what the visitor said (model first, regex as a safety net).
    confirming = stage == "confirming"
    system = prompts.EXTRACT.format(
        collected=_collected_text(lead),
        confirmation="CONFIRMATION PENDING: the assistant asked the visitor to confirm the callback details." if confirming else "",
    )
    try:
        extracted: LeadExtraction = await llm.extract_lead(system, _history(state))
    except LLMUnavailable as exc:
        log.warning("Extraction unavailable, using regex fallback: %s", exc)
        extracted = await _regex_fallback.extract_lead(system, _history(state))
    if confirming and extracted.confirmation == "none":
        if _QUICK_YES.match(text):
            extracted.confirmation = "yes"
        elif _QUICK_NO.match(text):
            extracted.confirmation = "no"

    before = dict(lead)
    lead, problems = lead_rules.merge(lead, extracted)
    changed = lead_rules.changed_fields(before, lead)
    out: dict = {"lead": lead, "handoff": handoff}

    # 2) Already submitted: pass new details to the dispatcher.
    if stage == "submitted":
        if changed and state.get("lead_id"):
            try:
                await leads.update_lead(state["lead_id"], lead)
            except Exception as exc:  # noqa: BLE001
                log.warning("Could not update lead %s: %s", state.get("lead_id"), exc)
            labels = ", ".join(lead_rules.FIELD_LABELS[f].lower() for f in changed)
            instruction = f"Thank them and say you've passed the {labels} to the dispatcher, who will call {lead.get('phone')} shortly."
            fallback = f"Thanks, I've passed that to the dispatcher. They'll call you at {lead.get('phone')} shortly."
        else:
            instruction = f"Reassure them that a dispatcher will call {lead.get('phone')} shortly, and they can share pickup, delivery and freight details here meanwhile, or call {site.dispatch_phone}."
            fallback = f"A dispatcher will call you at {lead.get('phone')} shortly. Meanwhile, feel free to share pickup, delivery and freight details here, or call {site.dispatch_phone}."
        reply = await _compose(llm, site, state, instruction, fallback, lead)
        return out | {"lead_stage": "submitted", "reply": reply, "suggestions": [], "sources": []}

    # 3) Confirmation answer.
    if stage == "confirming" and not lead_rules.missing_required(lead) and "phone" not in problems:
        if extracted.confirmation == "yes" and not changed:
            try:
                lead_id = await leads.create_lead(lead, session_id)
            except Exception as exc:  # noqa: BLE001
                log.error("Lead submission failed for %s: %s", session_id, exc)
                reply = f"Sorry, I couldn't send that to dispatch just now. Please call us directly at {site.dispatch_phone}, or tap \"Yes, call me\" to try again."
                _emit({"type": "token", "text": reply})
                return out | {"lead_stage": "confirming", "reply": reply, "suggestions": ["Yes, call me"], "flagged": True, "flag_reason": "lead_submit_failed"}
            _emit({"type": "lead", "status": "submitted", "lead_id": lead_id})
            missing_opt = lead_rules.missing_optional(lead)
            ask_more = (
                " Invite them to share their pickup and delivery locations, what they're shipping and when, so the dispatcher is ready when they call."
                if missing_opt
                else ""
            )
            instruction = f"Tell them it's done: a dispatcher will call {lead['phone']} shortly (dispatch runs 24/7).{ask_more}"
            fallback = (
                f"Done! A dispatcher will call you at {lead['phone']} shortly."
                + (" To speed things up, you can share your pickup and delivery locations, what you're shipping and when." if missing_opt else "")
            )
            reply = await _compose(llm, site, state, instruction, fallback, lead)
            return out | {"lead_stage": "submitted", "lead_id": lead_id, "reply": reply, "suggestions": [], "sources": []}
        if extracted.confirmation == "no" and not changed:
            instruction = "Ask what they'd like to correct: their name or phone number."
            fallback = "No problem. What should I change: your name or your phone number?"
            reply = await _compose(llm, site, state, instruction, fallback, lead)
            return out | {"lead_stage": "collecting", "reply": reply, "suggestions": [], "sources": []}

    # 4) Visitor doesn't want a call now: leave the flow politely, no nagging.
    # A short decline ("just browsing") wins over a name read from the same words.
    declined = extracted.declined or (bool(_DECLINE.search(text)) and len(text) < 60)
    if stage in ("none", "collecting") and declined and "phone" not in changed:
        lead = before
        out["lead"] = before
        instruction = (
            "They don't want a call right now. Acknowledge warmly in one sentence, say they can ask any question "
            f"here or call {site.dispatch_phone} whenever they're ready. Do not ask for their details."
        )
        fallback = f"No problem! Ask me anything about our services, or call {site.dispatch_phone} whenever you're ready."
        reply = await _compose(llm, site, state, instruction, fallback, lead)
        return out | {"lead_stage": "none", "handoff": False, "reply": reply, "suggestions": ["What services do you offer?"], "sources": []}

    # 5) Collect what's missing, or ask to confirm.
    if lead_rules.missing_required(lead) or "phone" in problems:
        instruction, fallback = _ask_missing(lead, handoff, "phone" in problems, site.dispatch_phone)
        reply = await _compose(llm, site, state, instruction, fallback, lead)
        return out | {"lead_stage": "collecting", "reply": reply, "suggestions": [], "sources": []}

    _emit({"type": "lead", "status": "confirming", "summary": [{"label": l, "value": v} for l, v in lead_rules.summary_lines(lead)]})
    instruction = f"Ask them to confirm a dispatcher should call {lead['name']} at {lead['phone']} now. Don't list other details."
    fallback = f"Just to confirm: should a dispatcher call {lead['name']} at {lead['phone']} now?"
    reply = await _compose(llm, site, state, instruction, fallback, lead)
    return out | {"lead_stage": "confirming", "reply": reply, "suggestions": ["Yes, call me", "Change details"], "sources": []}


# --------------------------------------------------------------------------- conversation (smalltalk / off-topic)


async def conversation(state: ChatState, config: RunnableConfig) -> dict:
    deps = _deps(config)
    site, llm = deps["site"], deps["llm"]
    pv = prompts.persona_vars(site, state.get("language", "en"))
    if state.get("intent") == "off_topic":
        system = prompts.OFF_TOPIC.format(**pv)
        fallback = f"I can only help with {site.company_name}'s freight services, quotes and questions about the company. What can I help you ship?"
        suggestions = ["What services do you offer?", "Request a call back"]
    else:
        system = prompts.SMALLTALK.format(**pv, lead_hint=_lead_hint(state))
        fallback = "Happy to help! Ask me about our hot shot, box truck or semi truck services, or I can have a dispatcher call you for a quote."
        suggestions = [] if state.get("lead_stage") == "submitted" else ["What services do you offer?", "Request a call back"]
    reply = await _stream_reply(llm, system, _history(state), fallback)
    if not check_output(reply, site.company_facts()).ok:
        reply = fallback
        _emit({"type": "replace", "text": reply})
    return {"reply": reply, "suggestions": suggestions, "sources": []}


# --------------------------------------------------------------------------- finalize


async def finalize(state: ChatState, config: RunnableConfig) -> dict:
    reply = state.get("reply") or f"Sorry, something went wrong. Please call dispatch at {_deps(config)['site'].dispatch_phone}."
    return {"messages": [AIMessage(content=reply)], "reply": reply}
