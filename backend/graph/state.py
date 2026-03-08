from typing import List, TypedDict, Dict, Optional
from pydantic import BaseModel


# =====================================================
# TODO STRUCTURE
# =====================================================

class TodoItem(BaseModel):
    id: int
    title: str
    description: str
    status: str = "pending"


# =====================================================
# PLANNING METADATA
# =====================================================

class PlanningMeta(BaseModel):
    total_tasks: int = 0
    validated: bool = False
    retry_count: int = 0
    validation_errors: List[str] = []


# =====================================================
# VIRTUAL FILE SYSTEM
# =====================================================

class FileMemory(BaseModel):
    filename: str
    content: str


# =====================================================
# AGENT GLOBAL STATE (Milestone-2)
# =====================================================

class AgentState(TypedDict):

    # User Input
    user_request: str

    # Planning
    todos: List[TodoItem]
    planning_meta: PlanningMeta

    # ✅ Execution Control
    current_task: Optional[int]
    completed_tasks: List[int]

    # ✅ Virtual Memory (IMPORTANT)
    files: Dict[str, str]

    # ✅ Agent Reasoning Trace
    execution_log: List[str]

    # Final Result
    final_output: str