from backend.graph.graph_builder import build_graph
from backend.graph.state import PlanningMeta


class DeepCognitiveExecutor:

    def __init__(self):
        self.graph = build_graph()

    def run(self, request: str):

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

            # ✅ Execution Control
            "current_task": None,
            "completed_tasks": [],

            # ✅ Virtual File System (Memory)
            "files": {},

            # ✅ Reasoning / Trace Logs
            "execution_log": [],

            # Final Output
            "final_output": ""
        }

        # ================================
        # RUN GRAPH
        # ================================
        result = self.graph.invoke(initial_state)

        return result