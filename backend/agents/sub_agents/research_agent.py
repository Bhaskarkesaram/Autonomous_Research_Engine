from backend.tools.file_system_tools import write_file


def research_agent(state, task):

    result = f"Research completed for: {task['title']}"

    write_file(
        state,
        f"research_{task['id']}.txt",
        result
    )

    return result