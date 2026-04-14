from backend.tools.delegation_tool import delegate_task
from backend.runtime.llm import call_llm
import re


def sanitize_text(text: str):
    text = re.sub(r"#+", "", text)
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"\n\s*\n", "\n\n", text)
    return text.strip()


def remove_duplicates(results):
    seen = set()
    unique = []

    for r in results:
        content = r["output"].strip()

        if content and content not in seen:
            seen.add(content)
            unique.append(r)

    return unique


def supervisor_agent(state):
    """
    FINAL SUPERVISOR (Production Ready)

    ✔ Executes all tasks
    ✔ Removes duplicate outputs
    ✔ Merges intelligently
    ✔ Generates clean structured final answer
    ✔ Prevents messy formatting
    """

    # =========================
    # INIT
    # =========================
    if "results" not in state:
        state["results"] = []

    # =========================
    # EXECUTE ALL TASKS
    # =========================
    for task in state["todos"]:

        if task["status"] == "pending":

            task_id = task["id"]
            title = task["title"]

            print(f"THINK → Running Task {task_id}: {title}")

            try:
                result = delegate_task(state, task)
                clean_result = sanitize_text(result)

            except Exception as e:
                clean_result = f"Error in task {task_id}: {str(e)}"

            # 🔥 PREVENT DUPLICATE STORAGE
            if clean_result not in [r["output"] for r in state["results"]]:
                state["results"].append({
                    "task_id": task_id,
                    "title": title,
                    "output": clean_result
                })

            task["status"] = "completed"

            state["execution_log"].append(
                f"Task {task_id} completed → {title}"
            )

    print("OBSERVE → All tasks executed")

    # =========================
    # REMOVE DUPLICATES (DOUBLE SAFETY)
    # =========================
    state["results"] = remove_duplicates(state["results"])

    # =========================
    # COMBINE RESULTS
    # =========================
    combined_text = "\n\n".join(
        [r["output"] for r in state.get("results", [])]
    )

    user_query = state.get("user_request", "")

    # =========================
    # FINAL LLM PROMPT (STRICT STRUCTURE)
    # =========================
    final_prompt = f"""
You are an advanced AI assistant.

User Query:
{user_query}

Below are intermediate insights:

{combined_text}

TASK:
- Merge all information
- Remove duplicates
- Remove repeated sections
- Fix incomplete sentences
- Ensure clean structure

FORMAT STRICTLY:

🧠 Title

📌 Overview
(Short explanation)

🔍 Key Insights
- Point 1
- Point 2
- Point 3

📊 Pattern
(Trends or relationships)

✅ Summary
(Final concise answer)

IMPORTANT:
- No repetition
- No duplicate topics
- Complete sentences only
- Clean formatting
- Do NOT mention tasks or agents

Final Answer:
"""

    try:
        response = call_llm(final_prompt)

        # 🔥 SAFETY CLEANING
        final_answer = sanitize_text(
            response if isinstance(response, str) else getattr(response, "content", "")
        )

    except Exception as e:
        print("FINAL LLM ERROR:", e)
        final_answer = sanitize_text(combined_text)

    # =========================
    # FINAL OUTPUT CLEANUP
    # =========================
    final_answer = final_answer.replace("📌", "\n\n📌")
    final_answer = final_answer.replace("🔍", "\n\n🔍")
    final_answer = final_answer.replace("📊", "\n\n📊")
    final_answer = final_answer.replace("✅", "\n\n✅")

    state["final_output"] = final_answer.strip()

    return state