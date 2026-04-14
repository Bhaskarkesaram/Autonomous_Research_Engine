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

    def run(self, request: str, detailed: bool = False) -> dict:
        """
        Run the cognitive engine for a given user request.
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
            "execution_log": [],   # 👈 THIS IS IMPORTANT

            # Final Output
            "final_output": "",

            "detailed": detailed
        }

        # ================================
        # EXECUTE GRAPH
        # ================================
        result = self.graph.invoke(initial_state)

        # ================================
        # 🔥 EXTRACT THINKING
        # ================================
        execution_log = result.get("execution_log", [])

        # Convert log → readable thinking
        thinking_text = ""

        if execution_log:
            formatted_logs = []
            for step in execution_log:
                # Handle dict logs or string logs
                if isinstance(step, dict):
                    msg = step.get("message") or str(step)
                else:
                    msg = str(step)

                formatted_logs.append(f"→ {msg}")

            thinking_text = "\n".join(formatted_logs)

        # ================================
        # FINAL OUTPUT
        # ================================
        final_output = result.get("final_output", "")

        # ================================
        # RETURN BASED ON MODE
        # ================================
        if detailed:
            return {
                "thinking": thinking_text,
                "final_output": final_output
            }
        else:
            return final_output