def planning_router(state: dict) -> str:
    """
    Routes flow after validation.

    If validated → go to execution
    If validation fails → retry planning
    """

    if state["planning_meta"]["validated"]:
        return "execution"
    else:
        return "planning"