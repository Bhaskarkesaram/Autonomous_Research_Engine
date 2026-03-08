from backend.tools.file_system_tools import read_file, write_file


def analysis_agent(state, task):

    research = read_file(
        state,
        f"research_{task['id']}.txt"
    )

    analysis = f"Analysis derived from research:\n{research}"

    write_file(
        state,
        f"analysis_{task['id']}.txt",
        analysis
    )

    return analysis