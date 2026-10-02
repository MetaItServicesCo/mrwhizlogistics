from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class ChatState(TypedDict, total=False):
    """Persisted per conversation by the LangGraph checkpointer."""

    messages: Annotated[list[BaseMessage], add_messages]

    # ---- Long-lived (survive across turns)
    language: str
    lead: dict
    lead_stage: str  # none | collecting | confirming | submitted
    lead_id: int | None
    handoff: bool

    # ---- Per turn (reset by the input guard)
    intent: str
    search_query: str
    reply: str
    sources: list[dict]
    suggestions: list[str]
    blocked: bool
    flagged: bool
    flag_reason: str | None
