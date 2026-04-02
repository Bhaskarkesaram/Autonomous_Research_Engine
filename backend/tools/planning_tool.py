import os
import json
import re
import requests
from typing import List, Dict
from dotenv import load_dotenv
from pathlib import Path


# --------------------------------------------------
# Load .env from project root
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct")


# --------------------------------------------------
# Planning Function
# --------------------------------------------------
def write_todos(request: str) -> List[Dict]:

    if not OPENROUTER_API_KEY:
        raise Exception(
            "OPENROUTER_API_KEY not found.\n"
            "Add it inside your .env file."
        )

    prompt = f"""
You are an expert AI planner specialized in healthcare AI systems.

USER OBJECTIVE:
{request}

STRICT INSTRUCTIONS:

- Generate EXACTLY 6 tasks
- Each task must represent ONE specific AI application in healthcare
- Tasks must NOT overlap
- Tasks must NOT be generic (NO "research", "analysis", etc.)
- Each task must focus on a DISTINCT application

MANDATORY STRUCTURE:

1. Medical Imaging
2. Clinical Decision Support
3. Predictive Analytics
4. Patient Engagement (Chatbots / Virtual Assistants)
5. Remote Monitoring / Telemedicine
6. Healthcare System Integration

FORMAT STRICTLY AS JSON:
[
  {{
    "id": 1,
    "title": "Medical Imaging",
    "description": "Analyze AI applications in medical imaging including diagnosis and segmentation",
    "status": "pending"
  }},
  ...
]

RULES:
- Do NOT combine multiple applications in one task
- Do NOT generate vague titles
- Each description must be under 40 words
- Output ONLY JSON (no explanation)
"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Autonomous-Cognitive-Engine",
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0,
                "max_tokens": 1200,
            },
            timeout=30
        )

    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error while calling OpenRouter: {e}")

    # ---------------------------------------------
    # Check HTTP response
    # ---------------------------------------------
    if response.status_code != 200:
        raise Exception(
            f"OpenRouter HTTP Error {response.status_code}:\n{response.text}"
        )

    data = response.json()

    if "error" in data:
        raise Exception(f"OpenRouter API Error:\n{data}")

    choices = data.get("choices")

    if not choices:
        raise Exception(f"No choices returned:\n{data}")

    message = choices[0].get("message", {})
    raw_text = message.get("content")

    if not raw_text:
        raise Exception("Model returned empty response.")

    # ---------------------------------------------
    # Extract JSON array
    # ---------------------------------------------
    match = re.search(r"\[[\s\S]*\]", raw_text)

    if not match:
        raise Exception(
            f"Could not extract JSON from model output:\n{raw_text}"
        )

    clean_json = match.group(0)

    # Clean formatting artifacts
    clean_json = clean_json.replace("```json", "")
    clean_json = clean_json.replace("```", "")
    clean_json = re.sub(r"[\x00-\x1f\x7f]", " ", clean_json)
    clean_json = re.sub(r",\s*]", "]", clean_json)
    clean_json = re.sub(r",\s*}", "}", clean_json)
    clean_json = clean_json.strip()

    # ---------------------------------------------
    # Parse JSON
    # ---------------------------------------------
    try:
        tasks = json.loads(clean_json)
    except Exception:
        raise Exception(
            "JSON parsing failed.\n\n"
            f"Raw output:\n{raw_text}\n\n"
            f"Cleaned output:\n{clean_json}"
        )

    # ---------------------------------------------
    # Validate structure
    # ---------------------------------------------
    if not isinstance(tasks, list):
        raise Exception("Model output is not a JSON list.")

    for task in tasks:
        if not isinstance(task, dict):
            raise Exception("Invalid task format.")

        if "id" not in task or "title" not in task or "description" not in task:
            raise Exception(f"Task missing required fields: {task}")

        if "status" not in task:
            task["status"] = "pending"

    return tasks