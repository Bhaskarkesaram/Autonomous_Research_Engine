from langchain_core.prompts import PromptTemplate
from backend.config.model_config import llm
from backend.tools.file_system_tools import read_file, write_file
from backend.config.settings import DEBUG

analysis_prompt = PromptTemplate(
    input_variables=["research_text"],
    template="""
You are an expert reasoning agent.

Analyze the following information:

{research_text}

Your task:
- Identify key insights
- Detect patterns
- Provide meaningful interpretation
- Explain reasoning clearly

Focus on understanding, not just repeating content.
"""
)


def analysis_agent(state, task):

    task_id = task["id"]

    if DEBUG:
        print(f"SUBAGENT → Analysis Agent processing Task {task_id}")

    research_text = read_file(
        state,
        f"research_{task_id}.txt"
    )

    if not research_text:
        return "No research data found."

    prompt = analysis_prompt.format(
        research_text=research_text
    )

    response = llm.invoke(prompt)
    analysis_text = response.content

    # Save analysis to memory
    write_file(
        state,
        f"analysis_{task_id}.txt",
        analysis_text
    )

    if DEBUG:
        print(f"WRITE FILE → analysis_{task_id}.txt")

    return analysis_text