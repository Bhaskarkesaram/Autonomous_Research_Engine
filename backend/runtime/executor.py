from backend.graph.graph_builder import build_graph
from backend.graph.state import PlanningMeta
from backend.runtime.llm import call_llm

class DeepCognitiveExecutor:
    """
    Executes the cognitive workflow using the LangGraph graph.
    """

    def __init__(self):
        # Build the execution graph
        self.graph = build_graph()

    def run(self, request: str,detailed: bool = False) -> dict:
        """
        Run the cognitive engine for a given user request.

        Args:
            request (str): User objective or request

        Returns:
            dict: Result state returned from the graph
        """

        # ================================
        # INITIAL AGENT STATE
        # ================================
        initial_state = {

            # User Input
            "user_request": request,

            # Planning
            "todos": [],
            "planning_meta": PlanningMeta(
                total_tasks=0,
                validated=False,
                retry_count=0,
                validation_errors=[]
            ),

            # Execution Control
            "current_task": None,
            "completed_tasks": [],

            # Virtual File System (Memory)
            "files": {},

            # Reasoning / Execution Logs
            "execution_log": [],

            # Final Output
            "final_output": "",

            "detailed": detailed
        }

        # ================================
        # EXECUTE GRAPH
        # ================================
        result = self.graph.invoke(initial_state)

        return result