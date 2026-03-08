from backend.agents.supervisor_agent import supervisor_agent


def execution_loop(state):

    while any(
        task["status"] == "pending"
        for task in state["todos"]
    ):
        state = supervisor_agent(state)

    return state