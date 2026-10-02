"""
Behavioral evaluation of the assistant with the REAL model and knowledge index.

    cd chatbot
    python -m evals.run_evals                 # all cases
    python -m evals.run_evals --only lead-    # cases whose id starts with "lead-"
    python -m evals.run_evals --min-pass 0.9  # exit 1 below this pass rate

Needs GROQ_API_KEY (LLM_PROVIDER=groq) and a populated knowledge index (the
service indexes the site on startup; or POST /chat-api/admin/knowledge/reindex).
Leads are recorded in memory, never sent to the backend. Writes
evals/report-<timestamp>.json with every reply for review.
"""

import argparse
import asyncio
import json
import re
import sys
import time
import uuid
from pathlib import Path

from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import InMemorySaver

from app.agent.graph import build_graph
from app.agent.llm import get_llm
from app.knowledge.base import kb
from app.site import site_config

HERE = Path(__file__).resolve().parent


class RecordingLeads:
    def __init__(self) -> None:
        self.created: list[dict] = []
        self.updated: list[dict] = []

    async def create_lead(self, lead: dict, session_id: str) -> int:
        self.created.append(dict(lead))
        return 1

    async def update_lead(self, lead_id: int, lead: dict) -> None:
        self.updated.append(dict(lead))


def check(expect: dict, state: dict, leads: RecordingLeads) -> list[str]:
    failures: list[str] = []
    reply = state.get("reply", "")
    if "intent" in expect and state.get("intent") != expect["intent"]:
        failures.append(f"intent={state.get('intent')!r}, expected {expect['intent']!r}")
    if "lead_stage" in expect and state.get("lead_stage", "none") != expect["lead_stage"]:
        failures.append(f"lead_stage={state.get('lead_stage')!r}, expected {expect['lead_stage']!r}")
    if expect.get("sources") and not state.get("sources"):
        failures.append("expected source links")
    for pattern in expect.get("contains", []):
        if not re.search(pattern, reply, re.I):
            failures.append(f"reply lacks /{pattern}/")
    for pattern in expect.get("not_contains", []):
        if re.search(pattern, reply, re.I):
            failures.append(f"reply contains forbidden /{pattern}/")
    if expect.get("lead_created") and len(leads.created) != 1:
        failures.append(f"expected exactly one lead, got {len(leads.created)}")
    if expect.get("lead_updated") and not leads.updated:
        failures.append("expected the lead to be enriched")
    lead = state.get("lead") or {}
    for key, value in expect.get("lead_fields", {}).items():
        if lead.get(key) != value:
            failures.append(f"lead.{key}={lead.get(key)!r}, expected {value!r}")
    for key in expect.get("lead_fields_present", []):
        if not lead.get(key):
            failures.append(f"lead.{key} missing")
    if "language" in expect and (state.get("language") or "").lower()[:2] != expect["language"]:
        failures.append(f"language={state.get('language')!r}, expected {expect['language']!r}")
    return failures


async def run_case(graph, case: dict, site, llm) -> dict:
    leads = RecordingLeads()
    thread = uuid.uuid4().hex
    config = {"configurable": {"thread_id": thread, "session_id": thread, "site": site, "llm": llm, "kb": kb, "leads": leads}}
    transcript, failures, latencies = [], [], []
    state: dict = {}
    for i, turn in enumerate(case["turns"]):
        started = time.monotonic()
        state = await graph.ainvoke({"messages": [HumanMessage(turn)]}, config=config)
        latencies.append(round(time.monotonic() - started, 2))
        transcript.append({"user": turn, "assistant": state.get("reply"), "intent": state.get("intent"), "lead_stage": state.get("lead_stage")})
        turn_expect = case.get("turn_expect", {}).get(str(i))
        if turn_expect:
            failures += [f"turn {i}: {f}" for f in check(turn_expect, state, leads)]
    failures += check(case.get("expect", {}), state, leads)
    return {"id": case["id"], "passed": not failures, "failures": failures, "latency_s": latencies, "transcript": transcript}


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="", help="run cases whose id starts with this prefix")
    parser.add_argument("--min-pass", type=float, default=0.0, help="exit 1 if the pass rate is below this")
    args = parser.parse_args()

    cases = [c for c in json.loads((HERE / "cases.json").read_text(encoding="utf-8"))["cases"] if c["id"].startswith(args.only)]
    await kb.reload_if_changed()
    if not len(kb.index):
        print("The knowledge index is empty. Start the service (it indexes the site) or trigger a re-index first.")
        return 2
    site = await site_config.get()
    llm = get_llm()
    graph = build_graph(InMemorySaver())

    results = []
    for case in cases:
        result = await run_case(graph, case, site, llm)
        results.append(result)
        mark = "PASS" if result["passed"] else "FAIL"
        print(f"{mark}  {case['id']:<28} {max(result['latency_s']):>5.1f}s  {'; '.join(result['failures'])}")

    passed = sum(r["passed"] for r in results)
    rate = passed / len(results) if results else 0
    all_latencies = sorted(l for r in results for l in r["latency_s"])
    p50 = all_latencies[len(all_latencies) // 2] if all_latencies else 0
    p95 = all_latencies[int(len(all_latencies) * 0.95) - 1] if all_latencies else 0
    print(f"\n{passed}/{len(results)} passed ({rate:.0%}) · turn latency p50 {p50:.1f}s, p95 {p95:.1f}s")
    report = HERE / f"report-{time.strftime('%Y%m%d-%H%M%S')}.json"
    report.write_text(json.dumps({"pass_rate": rate, "p50_s": p50, "p95_s": p95, "results": results}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Report: {report}")
    return 0 if rate >= args.min_pass else 1


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.exit(asyncio.run(main(), loop_factory=asyncio.SelectorEventLoop))
    sys.exit(asyncio.run(main()))
