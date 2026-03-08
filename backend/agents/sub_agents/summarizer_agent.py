from backend.tools.file_system_tools import read_file, write_file


def summarizer_agent(state, task):

    analysis = read_file(
        state,
        f"analysis_{task['id']}.txt"
    )

    summary = f"Summary created for Task {task['id']}"

    write_file(
        state,
        f"summary_{task['id']}.txt",
        summary
    )

    return summary