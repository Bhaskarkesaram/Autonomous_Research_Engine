# Autonomous Cognitive Engine

This repository demonstrates an autonomous planning/execution system with a LangGraph-powered backend.

## Configuration

The system uses **OpenRouter** as a backend LLM provider. You must set the following environment variables (typically in a `.env` file at the project root):

```text
OPENROUTER_API_KEY=sk-...    # your OpenRouter API key
OPENROUTER_MODEL=mistralai/mistral-7b-instruct  # optional; default is a working model
```

The planner tool (`backend/tools/planning_tool.py`) reads `OPENROUTER_MODEL` so you can switch between available endpoints. If you encounter the error `No endpoints found` at runtime, adjust this variable to a valid model or check your OpenRouter dashboard.

## Running

Activate your virtual environment and start the backend:

```powershell
python -m backend.main
```

Enter your request when prompted.

---
