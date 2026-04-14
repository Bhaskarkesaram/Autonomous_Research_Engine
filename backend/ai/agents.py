from backend.runtime.llm import call_llm


# =========================
# 🔥 SMART ROUTER (LLM BASED)
# =========================
def route_agent(query: str):
    prompt = f"""
You are an AI supervisor.

Decide the best reasoning type for the query.

Options:
- coding → programming tasks
- analysis → explanation, breakdown, reasoning
- research → factual or knowledge lookup
- creative → ideas, design, writing
- general → normal Q&A

Return ONLY one word.

Query:
{query}
"""

    try:
        decision = call_llm(prompt).strip().lower()
    except:
        return "general"

    if decision not in ["coding", "analysis", "research", "creative", "general"]:
        return "general"

    return decision


# =========================
# 🔥 DYNAMIC PROMPT BUILDER
# =========================
def build_agent_prompt(mode, query, context):
    context_text = "\n".join(context) if context else ""

    base = f"""
You are an advanced AI assistant like ChatGPT.

User Query:
{query}

Context:
{context_text}
"""

    if mode == "analysis":
        return base + """
Explain clearly step-by-step.
Break down concepts logically.
Keep it structured.
"""

    elif mode == "coding":
        return base + """
Provide clean, correct, production-level code.
Use best practices.
Explain only if necessary.
"""

    elif mode == "creative":
        return base + """
Be creative, unique, and engaging.
Give interesting ideas or perspectives.
"""

    elif mode == "research":
        return base + """
Provide factual, accurate, and well-structured information.
Use context where relevant.
"""

    else:
        return base + """
Answer naturally like ChatGPT.
Adapt depth based on the question.
Be clear and helpful.
"""