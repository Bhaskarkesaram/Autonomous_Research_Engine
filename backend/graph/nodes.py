from typing import Dict
import os
from backend.graph import state
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
def fast_answer(query, documents=None):

    file_context = ""

    if documents:
        for doc in documents:
            file_context += f"\n\nFile: {doc['name']}\n"
            file_context += doc["content"][:8000]

    results = web_search(query)
    context = build_context(results)
    sources = extract_sources(results)

    # =========================
    # 🔥 PART 1
    # =========================
    prompt1 = f"""
You are a professional research AI.

User Query:
{query}

Uploaded File Content:
{file_context}

Web Context:
{context}

IMPORTANT:
- If uploaded file content exists, answer primarily from it.
- Use web information only as supplementary context.
- Do NOT explain file formats.
- Be specific to the uploaded document.
- If the user asks to explain, summarize, review, analyze, or extract information from a file, use the uploaded file content as the main source.

Generate:

🔹 Title

📌 Overview
(5-6 lines explanation)

🔍 Key Concepts
• Each concept must have 3-4 lines explanation

🧠 Detailed Explanation
(8-10 lines deep explanation)

Rules:
- Do NOT repeat
- Avoid duplicate sentences
- Maintain clean structure
- Use professional formatting
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
    query = state["user_request"].lower()

    if any(
        word in query
        for word in [
            "compare",
            "difference",
            "vs",
            "versus",
        ]
    ):
        return {"next": "research"}

    if len(query.split()) > 12:
        return {"next": "research"}

    return {"next": "fast"}

# =========================
# FAST NODE
# =========================
def fast_node(state):
    return {"final_output": fast_answer(state["user_request"], state.get("documents", []))}


# =========================
# PLANNING
# =========================
def planning_node(state: Dict) -> Dict:

    query = state["user_request"]

    plan_prompt = f"""
Create a research plan.

Query:
{query}

Return:

1. Main Topic
2. Key Subtopics
3. Information Needed
4. Research Strategy
"""

    plan = call_llm(plan_prompt)

    return {
        "plan": plan
    }


# =========================
# VALIDATION
# =========================
def validation_node(state: Dict) -> Dict:

     state.setdefault(
        "execution_log",
        []
    ).append(
        "Validating sources..."
    )
     
     results = state.get(
        "search_results",
        []
    )

     validated = []
     sources = []

     for r in results:

        content = r.get(
            "content",
            ""
        )

        if len(content) > 50:
            validated.append(r)

            if r.get("url"):
                sources.append(
                    r["url"]
                )

     return {
        "validated_results":
            validated,
        "sources":
            sources,
    }

# =========================
# EXECUTION
# =========================
def execution_node(state: Dict) -> Dict:

    query = state["user_request"]

    results = web_search(query)

    return {
        "search_results": results
    }


# =========================
# SYNTHESIS
# =========================
def synthesis_node(state: Dict) -> Dict:

    state.setdefault(
        "execution_log",
        []
    ).append(
        "Generating report..."
    )

    results = state.get(
        "validated_results",
        []
    )

    context = build_context(results)

    query = state["user_request"]

    plan = state.get(
        "plan",
        ""
    )

    sources = state.get(
        "sources",
        []
    )

    prompt = f"""
You are a senior research analyst.

Research Plan:
{plan}

Question:
{query}

Research:
{context}

Generate:

📌 Overview

🔍 Key Concepts

🧠 Detailed Explanation

📊 Advantages

⚠️ Limitations

📈 Real-World Applications

✅ Summary

Rules:
- Be detailed
- Avoid repetition
- Use professional formatting
- Keep explanations practical
"""

    final_output = call_llm(prompt)

    if sources:
        final_output += "\n\n📚 Sources\n"

        for i, src in enumerate(
            sources,
            1
        ):
            final_output += (
                f"[{i}] {src}\n"
            )

    return {
        "final_output":
            final_output
    }
# =========================
# 🚀 ENTRY NODE
# =========================
def research_node(state: Dict) -> Dict:

    print("RESEARCH DOCUMENTS =", state.get("documents"))

    documents = state.get("documents", [])

    print("DOCUMENT COUNT =", len(documents))

    # ==================================================
    # DOCUMENT ANALYSIS MODE
    # ==================================================
    if documents:

        query = state["user_request"].lower()

        is_multi_file = len(documents) > 1

        print("MULTI FILE MODE =", is_multi_file)

        # --------------------------------------------------
        # MODE DETECTION
        # --------------------------------------------------
        if "summary" in query:
            mode = "summary"

        elif "skill" in query:
            mode = "skills"

        elif "requirement" in query:
            mode = "requirements"

        elif "roadmap" in query:
            mode = "roadmap"

        elif (
            "implementation" in query
            or "project structure" in query
            or "code" in query
        ):
            mode = "implementation"

        elif any(
            word in query
            for word in [
                "compare",
                "comparison",
                "difference",
                "differences",
                "similarities",
                "similarity",
                "vs",
                "versus"
            ]
        ):
            mode = "comparison"

        else:
            mode = "analysis"

        print("DOCUMENT MODE =", mode)

        # --------------------------------------------------
        # BUILD DOCUMENT CONTEXT
        # --------------------------------------------------
        document_context = ""

        for index, doc in enumerate(
            documents,
            start=1
        ):

            document_context += f"""

====================================
FILE {index}
====================================

NAME:
{doc['name']}

CONTENT:
{doc['content'][:8000]}

====================================

"""

        # --------------------------------------------------
        # MULTI FILE PROMPT
        # --------------------------------------------------
        if is_multi_file:

            prompt = f"""
You are an expert document comparison analyst.

User Request:
{state['user_request']}

Documents:
{document_context}

IMPORTANT RULES:

1. Analyze EACH file separately.
2. Mention file names.
3. Use uploaded files as the primary source.
4. Every major finding must include citations.
5. Citation format:

[Source: filename]

6. Do not explain file formats.
7. Highlight similarities and differences clearly.
8. Use only uploaded documents whenever possible.

Mode:
{mode}

Response Rules:

comparison
→ 📄 File Summaries
→ 📊 Similarities
→ ⚖ Differences
→ 🎯 Key Findings
→ ✅ Conclusion

summary
→ 📄 Summary of Each File
→ 📌 Combined Overview
→ ✅ Final Summary

skills
→ 🛠 Skills Found Across Files
→ 📚 Knowledge Areas
→ 🚀 Learning Roadmap

requirements
→ 📋 Requirements Per File
→ ⚠ Mandatory Conditions
→ ✅ Deliverables

roadmap
→ 🗺 Step-by-Step Roadmap
→ 📚 Topics To Learn
→ ⚙ Implementation Order

implementation
→ 🏗 Project Structure
→ ⚙ Components
→ 💻 Code Components

analysis
→ 📌 Overview
→ 🔍 Key Concepts
→ 🧠 Detailed Analysis
→ 📊 Findings
→ ⚠ Issues
→ ✅ Conclusion

Include citations throughout the answer.
"""

        else:

            prompt = f"""
You are an expert document analyst.

Mode:
{mode}

User Request:
{state['user_request']}

Uploaded Document:
{document_context}

IMPORTANT RULES:

1. Use the uploaded document as the PRIMARY source.
2. Do NOT explain file formats.
3. Answer the user's actual request.
4. Every major finding must include a citation.
5. Citation format:

[Source: filename]

6. Use citations for:
   - Skills
   - Requirements
   - Deadlines
   - Instructions
   - Findings
   - Conclusions

Response Rules:

summary
→ 📌 Overview
→ 🔍 Key Points
→ ✅ Summary

skills
→ 🛠 Required Skills
→ 📚 Knowledge Areas
→ 🚀 Preparation Roadmap

requirements
→ 📋 Requirements
→ ⚠ Mandatory Conditions
→ ✅ Deliverables

roadmap
→ 🗺 Step-by-Step Roadmap
→ 📚 Topics To Learn
→ ⚙ Implementation Order

implementation
→ 🏗 Project Structure
→ ⚙ Components
→ 💻 Code Components

analysis
→ 📌 Overview
→ 🔍 Key Concepts
→ 🧠 Detailed Analysis
→ 📊 Findings
→ ⚠ Issues
→ ✅ Conclusion

Use only uploaded document information whenever possible.
Include citations throughout the answer.
"""

        print("\n========== DOCUMENT PROMPT ==========")
        print(prompt[:3000])
        print("========== END DOCUMENT PROMPT ==========\n")

        response = call_llm(prompt)

        print("\n========== DOCUMENT RESPONSE ==========")
        print(response[:1500])
        print("========== END DOCUMENT RESPONSE ==========\n")

        return {
            "final_output": response
        }

    # ==================================================
    # NORMAL WEB RESEARCH MODE
    # ==================================================

    route = supervisor_node(state)

    if route["next"] == "fast":
        return fast_node(state)

    state.update(
        planning_node(state)
    )

    state.update(
        execution_node(state)
    )

    state.update(
        validation_node(state)
    )

    state.update(
        synthesis_node(state)
    )

    return {
        "final_output": state["final_output"]
    }