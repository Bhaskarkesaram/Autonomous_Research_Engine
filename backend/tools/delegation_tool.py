from backend.agents.sub_agents.research_agent import research_agent
from backend.agents.sub_agents.analysis_agent import analysis_agent
from backend.agents.sub_agents.summarizer_agent import summarizer_agent


def delegate_task(state, task):
    """
    Decide which sub-agent should execute the task.
    """

    title = task["title"].lower()

    if "research" in title or "collect" in title:
        return research_agent(state, task)

    elif "analyze" in title or "analysis" in title:
        return analysis_agent(state, task)

    else:
        return summarizer_agent(state, task)