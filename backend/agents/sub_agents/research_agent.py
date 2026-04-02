from langchain_core.prompts import PromptTemplate
from backend.config.model_config import llm
from backend.tools.file_system_tools import write_file
from backend.config.settings import DEBUG
from backend.tools.search_tool import search_tool

research_prompt = PromptTemplate(
    input_variables=["topic", "description"],
template="""
You are a healthcare AI research agent.

TASK:
{topic}

DESCRIPTION:
{description}

Provide detailed raw research information:
- Explain concepts clearly
- Include examples
- Include technical details if possible

DO NOT summarize.
DO NOT compress.
"""
)


def research_agent(state, task):

    task_id = task["id"]
    topic = task["title"]
    description = task.get("description", "")

    # 🔥 Get real-time data
    search_results = search_tool(topic)

    external_context = "\n".join(search_results) if search_results else "No external data found."

    prompt = research_prompt.format(
        topic=topic,
        description=f"{description}\n\nExternal Data:\n{external_context}"
    )

    response = llm.invoke(prompt)
    research_text = response.content

    write_file(
        state,
        f"research_{task_id}.txt",
        research_text
    )
    return research_text