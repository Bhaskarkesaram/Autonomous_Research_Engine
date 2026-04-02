from langgraph.graph import StateGraph, END

from backend.graph.state import AgentState
from backend.graph.nodes import (
    supervisor_node,
    planning_node,
    validation_node,
    execution_node,
    synthesis_node
)

from backend.graph.conditional_edges import planning_router


def build_graph():

    workflow = StateGraph(AgentState)

    # =================================
    # REGISTER NODES
    # =================================

    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("planning", planning_node)
    workflow.add_node("validation", validation_node)
    workflow.add_node("execution", execution_node)
    workflow.add_node("synthesis", synthesis_node)

    # =================================
    # ENTRY POINT
    # =================================

    workflow.set_entry_point("supervisor")

    # =================================
    # SUPERVISOR ROUTING
    # =================================

    workflow.add_conditional_edges(
        "supervisor",
        lambda state: state.get("next"),
        {
            "planning": "planning",
            "validation": "validation",
            "execution": "execution",
            "synthesis": "synthesis",
        }
    )

    # =================================
    # WORKFLOW TRANSITIONS
    # =================================

    # planning → validation
    workflow.add_edge("planning", "validation")

    # validation → planning OR execution
    workflow.add_conditional_edges(
        "validation",
        planning_router
    )

    # execution → supervisor
    workflow.add_edge("execution", "supervisor")

    # synthesis → end
    workflow.add_edge("synthesis", END)

    return workflow.compile()