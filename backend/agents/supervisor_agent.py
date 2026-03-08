from backend.tools.delegation_tool import delegate_task


def supervisor_agent(state):

    for task in state["todos"]:

        if task["status"] == "pending":

            delegate_task(state, task)

            task["status"] = "completed"

            state["execution_log"].append(
                f"Task {task['id']} completed"
            )

            break

    return state