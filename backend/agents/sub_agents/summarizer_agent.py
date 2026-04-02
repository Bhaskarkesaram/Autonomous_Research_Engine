from langchain_core.prompts import PromptTemplate
from backend.config.model_config import llm
from backend.tools.file_system_tools import read_file, write_file
from backend.config.settings import DEBUG
import json
import re


# 🔹 STRICT PROMPT (VERY IMPORTANT)
summary_prompt = PromptTemplate(
    input_variables=["analysis_text"],
    template="""
You are a healthcare AI summarization agent.

Return ONLY valid JSON:

{{
  "title": "",
  "overview": "",
  "insights": ["", "", ""],
  "pattern": "",
  "summary": ""
}}

Rules:
- No markdown
- No extra text
- Valid JSON only

Analysis:
{analysis_text}
"""
)


# 🔹 CLEAN JSON FUNCTION
def clean_json(text):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    return text.strip()


# 🔹 FORMAT OUTPUT (FINAL CLEAN TEXT)
def format_output(data):
    return f"""
🧠 {data.get("title", "")}

📌 Overview  
{data.get("overview", "")}

🔍 Key Insights  
{chr(10).join([f"- {i}" for i in data.get("insights", [])])}

📊 Pattern  
{data.get("pattern", "")}

✅ Summary  
{data.get("summary", "")}
"""


# 🔥 MAIN AGENT FUNCTION (FIXED)
def summarizer_agent(state, task):

    task_id = task["id"]

    if DEBUG:
        print(f"SUBAGENT → Summarizer Agent processing Task {task_id}")

    analysis_text = read_file(state, f"analysis_{task_id}.txt")

    if not analysis_text:
        return "No analysis data found."

    prompt = summary_prompt.format(analysis_text=analysis_text)

    response = llm.invoke(prompt)

    # 🔥 STEP 1: Parse JSON safely
    try:
        data = json.loads(response.content)
    except:
        try:
            cleaned = clean_json(response.content)
            data = json.loads(cleaned)
        except Exception as e:
            if DEBUG:
                print("JSON PARSE ERROR:", response.content)
            return response.content  # fallback (rare)

    # 🔥 STEP 2: Format clean output
    summary_text = format_output(data)

    # 🔥 STEP 3: Save CLEAN output (not raw)
    write_file(
        state,
        f"summary_{task_id}.txt",
        summary_text
    )

    if DEBUG:
        print(f"WRITE FILE → summary_{task_id}.txt")

    return summary_text