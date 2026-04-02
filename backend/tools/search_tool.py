import os
from tavily import TavilyClient

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def search_tool(query: str):
    try:
        results = tavily.search(query=query, max_results=3)
        return [r["content"] for r in results["results"]]
    except Exception:
        return []