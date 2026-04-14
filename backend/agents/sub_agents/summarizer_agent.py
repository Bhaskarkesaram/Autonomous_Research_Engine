from langchain_core.prompts import PromptTemplate
from backend.config.model_config import llm
from backend.tools.file_system_tools import read_file, write_file
from backend.config.settings import DEBUG


# =========================
# 🔥 UPDATED PROMPT
# =========================
summary_prompt = PromptTemplate(
    input_variables=["analysis_text"],
    template="""
You are an advanced AI assistant.

Based on the analysis below, generate a structured and clean response.

Analysis:
{analysis_text}

Instructions:
- Organize output into sections
- Use clear headings with emojis
- Keep it readable and well-structured
- Avoid unnecessary repetition
- Do NOT mention internal steps

Format:

🔹 Topic Title

📌 Overview  
Short explanation

🔍 Key Insights  
- Point 1  
- Point 2  
- Point 3  

📊 Pattern  
(If applicable, otherwise skip)

✅ Summary  
Concise conclusion

IMPORTANT:
- Maintain clean formatting
- Do NOT output JSON
- Do NOT include markdown symbols like ** or ###

Final Answer:
"""
)


# =========================
# 🔥 SUMMARIZER AGENT
# =========================
def summarizer_agent(state, task):

    task_id = task["id"]

    if DEBUG:
        print(f"SUBAGENT → Summarizer Agent processing Task {task_id}")

    # 🔹 Get analysis result
    analysis_text = read_file(state, f"analysis_{task_id}.txt")

    if not analysis_text:
        return "No analysis data found."

    # 🔹 Build prompt
    prompt = summary_prompt.format(analysis_text=analysis_text)

    # 🔹 Call LLM
    response = llm.invoke(prompt)
    summary_text = response.content.strip()

    # 🔹 Save clean final output
    write_file(
        state,
        f"summary_{task_id}.txt",
        summary_text
    )

    if DEBUG:
        print(f"WRITE FILE → summary_{task_id}.txt")

    return summary_text