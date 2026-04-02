from backend.agents.sub_agents.research_agent import research_agent
from backend.agents.sub_agents.analysis_agent import analysis_agent
from backend.agents.sub_agents.summarizer_agent import summarizer_agent
from backend.config.settings import DEBUG

def delegate_task(state, task):
    """
    Intelligent delegation based on task type.
    Ensures correct agent is used and prevents overwrite issues.
    """

    task_id = task.get("id")
    title = task.get("title", "").lower()
    description = task.get("description", "").lower()

    logs = state.setdefault("execution_log", [])

    # =====================================================
    # DETERMINE TASK TYPE (STRICT MATCHING)
    # =====================================================

    if title.startswith("research"):
        agent = research_agent
        agent_name = "research_agent"

    elif title.startswith("analysis"):
        agent = analysis_agent
        agent_name = "analysis_agent"

    elif title.startswith("summary") or title.startswith("summarize"):
        agent = summarizer_agent
        agent_name = "summarizer_agent"

    else:
        if "analysis" in description:
            agent = analysis_agent
            agent_name = "analysis_agent"
        elif "summary" in description or "summarize" in description:
            agent = summarizer_agent
            agent_name = "summarizer_agent"
        else:
            agent = research_agent
            agent_name = "research_agent"

    # =====================================================
    # LOG DELEGATION (CLEAN + EXPLICIT)
    # =====================================================

    msg = f"DELEGATION → {agent_name} handling Task {task_id}"
    logs.append(msg)

    if DEBUG:
     print(msg)

    # =====================================================
    # EXECUTE AGENT
    # =====================================================

    result = agent(state, task)
