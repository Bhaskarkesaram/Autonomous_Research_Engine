def write_file(state, filepath, content):
    """
    Write content to the virtual file system.
    """

    if "files" not in state:
        state["files"] = {}

    state["files"][filepath] = content


def read_file(state, filepath):
    """
    Read content from the virtual file system.
    """

    if "files" not in state:
        state["files"] = {}

    return state["files"].get(filepath, "")


def edit_file(state, filepath, content):
    """
    Append content to an existing virtual file.
    """

    if "files" not in state:
        state["files"] = {}

    previous = state["files"].get(filepath, "")

    state["files"][filepath] = previous + "\n" + content


def list_files(state):
    """
    List all files stored in the virtual memory.
    """

    if "files" not in state:
        state["files"] = {}

    return list(state.get("files", {}).keys())