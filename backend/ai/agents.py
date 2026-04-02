def route_agent(query):
    q = query.lower()

    if "code" in q or "program" in q:
        return "coder"

    if "explain" in q or "what is" in q:
        return "teacher"

    if "analyze" in q or "data" in q:
        return "analyst"

    return "general"


def build_agent_prompt(agent, query, context):
    context_text = "\n".join(context)

    if agent == "coder":
        role = "You are a senior software engineer."

    elif agent == "teacher":
        role = "You are a clear and simple teacher."

    elif agent == "analyst":
        role = "You are a data analyst."

    else:
        role = "You are an intelligent assistant."

    return f"""
{role}

Context:
{context_text}

User Query:
{query}

Answer clearly and accurately:
"""