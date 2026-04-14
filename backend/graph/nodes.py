from typing import Dict
import os
from dotenv import load_dotenv
from tavily import TavilyClient
from groq import Groq

from backend.tools.file_system_tools import write_file, read_file

# =========================
# ENV
# =========================
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# =========================
# CLIENTS
# =========================
client = Groq(api_key=GROQ_API_KEY)
tavily = TavilyClient(api_key=TAVILY_API_KEY)

# =========================
# 🤖 LLM CALL
# =========================
def call_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=GROQ_MODEL,
        temperature=0.3,
        max_tokens=800
    )
    return response.choices[0].message.content


# =========================
# 🔎 SEARCH
# =========================
def web_search(query):
    res = tavily.search(query=query, search_depth="basic", max_results=3)
    return res.get("results", [])


# =========================
# 🧠 CONTEXT (WITH CITATION INDEX)
# =========================
def build_context(results):
    context = ""
    for i, r in enumerate(results, 1):
        content = r.get("content", "")[:200]
        context += f"[{i}] {content}\n"
    return context


# =========================
# 📚 SOURCES
# =========================
def extract_sources(results):
    links = []
    for r in results:
        url = r.get("url")
        if url:
            links.append(url)
        else:
            content = r.get("content", "")
            links.append(content[:80] + "...")
    return links


# =========================
# ⚡ ANSWER ENGINE
# =========================
def fast_answer(query):

    results = web_search(query)
    context = build_context(results)
    sources = extract_sources(results)

    # =========================
    # 🔥 PART 1
    # =========================
    prompt1 = f"""
You are a professional research AI.

Query:
{query}

Context:
{context}

Generate:

🔹 Title

📌 Overview  
(5-6 lines explanation)

🔍 Key Concepts  
• Each concept must have 3-4 lines explanation  
• Do NOT include citation numbers like [1], [2] in the text.  

🧠 Detailed Explanation  
(8-10 lines deep explanation with citations)

Rules:
- Do NOT repeat
- Avoid duplicate sentences
- Maintain clean structure
"""

    part1 = call_llm(prompt1)

    # =========================
    # 🔥 PART 2
    # =========================
    prompt2 = f"""
Continue the SAME answer.

Generate:

📊 Advantages  
• Each with explanation + citations  

⚠️ Limitations  
• Each with explanation + citations  

📈 Real-World Applications  
• Practical examples with citations  

✅ Summary  
(4-5 lines)

Rules:
- Do NOT repeat previous content
- Continue smoothly
- Do NOT include citation numbers like [1], [2] in the text.
- Each bullet must be separate line
"""

    part2 = call_llm(prompt2)

    # =========================
    # 🔥 FINAL MERGE
    # =========================
    final_output = part1.strip() + "\n\n" + part2.strip()

    # =========================
    # 📚 ADD SOURCES
    # =========================
    if sources:
        final_output += "\n\n📚 Sources\n"
        for i, s in enumerate(sources, 1):
            final_output += f"[{i}] {s}\n"

    return final_output


# =========================
# SUPERVISOR
# =========================
def supervisor_node(state):
    return {"next": "fast"}


# =========================
# FAST NODE
# =========================
def fast_node(state):
    return {"final_output": fast_answer(state["user_request"])}


# =========================
# PLANNING
# =========================
def planning_node(state: Dict) -> Dict:
    return {}


# =========================
# VALIDATION
# =========================
def validation_node(state: Dict) -> Dict:
    return {}


# =========================
# EXECUTION
# =========================
def execution_node(state: Dict) -> Dict:
    return {}


# =========================
# SYNTHESIS
# =========================
def synthesis_node(state: Dict) -> Dict:
    return {"final_output": state.get("final_output", "")}


# =========================
# 🚀 ENTRY NODE
# =========================
def research_node(state: Dict) -> Dict:
    return {"final_output": fast_answer(state.get("user_request", ""))}