from backend.tools.delegation_tool import delegate_task
import re


def sanitize_text(text):
    """Final cleanup layer (safety net)"""
    text = re.sub(r"#+", "", text)
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"\n\s*\n", "\n", text)
    return text.strip()


def supervisor_agent(state):
    """
    Improved Supervisor Agent

    Enhancements:
    - Stores all results
    - Prevents overwriting
    - Maintains clean structured output
    """

    # 🔹 Initialize results store (first run only)
    if "results" not in state:
        state["results"] = []

    for task in state["todos"]:

        if task["status"] == "pending":

            task_id = task["id"]
            title = task["title"]

            print(f"THINK → Supervisor selecting Task {task_id}: {title}")

            # 🔥 Delegate task
            result = delegate_task(state, task)

            # 🔥 Clean result (safety layer)
            clean_result = sanitize_text(result)

            # 🔥 Store result properly (NO overwrite)
            state["results"].append({
                "task_id": task_id,
                "title": title,
                "output": clean_result
            })

            # Mark task completed
            task["status"] = "completed"

            # Log execution
            state["execution_log"].append(
                f"Task {task_id} completed → {title}"
            )

            print(f"OBSERVE → Task {task_id} completed")

            break

    else:
        print("All tasks completed")

        # 🔥 FINAL OUTPUT (combine all results cleanly)
        final_output = "\n\n".join(
            [r["output"] for r in state.get("results", [])]
        )

        state["final_output"] = final_output

    return state