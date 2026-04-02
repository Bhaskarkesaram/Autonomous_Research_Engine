def build_prompt(query, context, history=""):
    context_text = "\n".join(context)

    return f"""
You are an advanced AI assistant.

Conversation History:
{history}

Relevant Context:
{context_text}

User Question:
{query}

Instructions:
- Answer clearly
- Use context if relevant
- If unsure, say "I don't know"
- Keep it structured

Final Answer:
"""