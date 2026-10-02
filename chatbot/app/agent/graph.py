"""
The agent workflow:

    START -> guard_input -> router (orchestrator) -> knowledge | lead | conversation -> finalize -> END
                       \\-> finalize (blocked input)

Output guarding happens inside each specialist (it needs the evidence the
answer was built from). State is checkpointed per conversation (thread_id =
chat session id), so the lead flow survives reloads and worker restarts.
"""

from langgraph.graph import END, START, StateGraph

from app.agent import nodes
from app.agent.state import ChatState


def build_graph(checkpointer=None):
    graph = StateGraph(ChatState)
    graph.add_node("guard_input", nodes.guard_input)
    graph.add_node("router", nodes.router)
    graph.add_node("knowledge", nodes.knowledge)
    graph.add_node("lead", nodes.lead_agent)
    graph.add_node("conversation", nodes.conversation)
    graph.add_node("finalize", nodes.finalize)

    graph.add_edge(START, "guard_input")
    graph.add_conditional_edges("guard_input", nodes.after_input, {"router": "router", "finalize": "finalize"})
    graph.add_conditional_edges(
        "router",
        nodes.route_intent,
        {"knowledge": "knowledge", "lead": "lead", "conversation": "conversation"},
    )
    for specialist in ("knowledge", "lead", "conversation"):
        graph.add_edge(specialist, "finalize")
    graph.add_edge("finalize", END)
    return graph.compile(checkpointer=checkpointer)
