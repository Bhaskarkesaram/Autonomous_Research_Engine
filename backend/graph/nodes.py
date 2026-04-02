from typing import Dict
import json
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

from backend.graph import state
from backend.tools.planning_tool import write_todos
from backend.tools.file_system_tools import write_file, read_file
from backend.tools.delegation_tool import delegate_task
from backend.config.settings import DEBUG

# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "meta-llama/llama-3.1-8b-instruct"
)


# =====================================================
# LLM CALL FUNCTION
# =====================================================

def call_llm(prompt: str) -> str:

    if not OPENROUTER_API_KEY:
        raise Exception("OPENROUTER_API_KEY missing in .env")

    for attempt in range(3):

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 500
            },
            timeout=30
        )

        if response.status_code != 200:
            continue

        data = response.json()

        if "choices" not in data:
            continue

        content = data["choices"][0]["message"]["content"]

        if content and len(content.strip()) > 50:
            return content

    return "LLM failed to generate a valid response."


# =====================================================
# MEMORY TREE BUILDER
# =====================================================

def build_memory_tree(files: Dict) -> str:
    """
    Convert the flat virtual file dictionary
    into a readable folder tree structure.
    """

    tree = {}

    for path in files.keys():

        parts = path.split("/")
        current = tree

        for part in parts:
            current = current.setdefault(part, {})

    def render_tree(node, indent=0):

        output = ""

        for key, value in node.items():

            output += "   " * indent + key + "\n"
            output += render_tree(value, indent + 1)

        return output

    return render_tree(tree)

# =====================================================
# SUPERVISOR NODE
# =====================================================

def supervisor_node(state):
    """
    Decide which step should run next.
    """

    # If tasks not created yet → planning
    if not state.get("todos"):
        return {"next": "planning"}

    planning_meta = state.get("planning_meta", {})

    # If plan not validated → validation
    if not planning_meta.get("validated"):
        return {"next": "validation"}

    # If tasks still remaining → execution
    if len(state.get("completed_tasks", [])) < len(state.get("todos", [])):
        return {"next": "execution"}

    # Otherwise → synthesis
    return {"next": "synthesis"}



# =====================================================
# PLANNING NODE (Milestone-1)
# =====================================================

def planning_node(state: Dict) -> Dict:

    user_request = state["user_request"]

    todos = write_todos(user_request)

    planning_meta = state.get("planning_meta")

    if planning_meta:
        retry_count = getattr(planning_meta, "retry_count", 0) + 1
    else:
        retry_count = 1

    logs = state.setdefault("execution_log", [])

    write_file(
        state,
        "memory/planning/task_plan.json",
        json.dumps(todos, indent=2)
    )

    logs.append(
        "Planning completed → memory/planning/task_plan.json"
    )

    return {
        "todos": todos,
        "planning_meta": {
            "total_tasks": len(todos),
            "retry_count": retry_count,
            "validated": False,
            "validation_errors": []
        }
    }


# =====================================================
# VALIDATION NODE
# =====================================================

def validation_node(state: Dict) -> Dict:

    errors = []
    todos = state.get("todos", [])

    if not (5 <= len(todos) <= 8):
        errors.append("Invalid number of tasks")

    for idx, task in enumerate(todos, start=1):

        if task["id"] != idx:
            errors.append("Task IDs not sequential")

        if len(task["description"].strip()) < 20:
            errors.append("Description too short")

    planning_meta = state.get("planning_meta", {})

    planning_meta["validation_errors"] = errors
    planning_meta["validated"] = len(errors) == 0

    return {
        "planning_meta": planning_meta
    }


# =====================================================
# EXECUTION NODE (Milestone-2)
# =====================================================
def execution_node(state: Dict) -> Dict:

    todos = state.get("todos", [])
    completed = state.setdefault("completed_tasks", [])
    logs = state.setdefault("execution_log", [])
    files = state.setdefault("files", {})

    for task in todos:

        task_id = task.get("id")

        if task_id in completed:
            continue

        state["current_task"] = task_id

        msg = f"THINK → Supervisor analyzing Task {task_id}"
        logs.append(msg)
        if DEBUG:
            print(msg)

        # -------------------------------
        # STEP 1 — RESEARCH
        # -------------------------------
        msg = f"TASK TOOL → research: {task['title']}"
        logs.append(msg)
        if DEBUG:
            print(msg)

        delegate_task(state, {
            "id": task_id,
            "title": f"research: {task['title']}",
            "description": task["description"]
        })

        # -------------------------------
        # STEP 2 — ANALYSIS
        # -------------------------------
        msg = f"TASK TOOL → analysis: {task['title']}"
        logs.append(msg)
        if DEBUG:
            print(msg)

        delegate_task(state, {
            "id": task_id,
            "title": f"analysis: {task['title']}",
            "description": task["description"]
        })

        # -------------------------------
        # STEP 3 — SUMMARY
        # -------------------------------
        msg = f"TASK TOOL → summary: {task['title']}"
        logs.append(msg)
        if DEBUG:
            print(msg)

        delegate_task(state, {
            "id": task_id,
            "title": f"summary: {task['title']}",
            "description": task["description"]
        })

        completed.append(task_id)

        msg = f"OBSERVE → Task {task_id} completed"
        logs.append(msg)
        if DEBUG:
            print(msg)

    return {
        "completed_tasks": completed,
        "execution_log": logs,
        "files": files
    }

# =====================================================
# SYNTHESIS NODE
# =====================================================
def synthesis_node(state: Dict) -> Dict:

   
    todos = state.get("todos", [])
    detailed = state.get("detailed", False)

    outputs = []

    for task in todos:
        task_id = task["id"]

        research = read_file(state, f"research_{task_id}.txt")
        analysis = read_file(state, f"analysis_{task_id}.txt")
        summary = read_file(state, f"summary_{task_id}.txt")

        if detailed:
            content = f"""
==================================================
🧠 Task: {task['title']}
==================================================

📌 Research Output:
{research}

--------------------------------------------------

🔍 Analysis Output:
{analysis}

--------------------------------------------------

✅ Final Summary:
{summary}

==================================================
"""
        else:
            content = f"""
🔹 {task['title']}
{summary}
"""

        outputs.append(content)

    final_answer = "\n".join(outputs)

    write_file(state, "memory/final_answer.txt", final_answer)

    return {
        "final_output": final_answer.strip()
    }