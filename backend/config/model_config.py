import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI


# Load environment variables
load_dotenv()

# Read model from .env
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "meta-llama/llama-3.1-8b-instruct"
)


# Shared LLM instance used across agents
llm = ChatOpenAI(
    model=OPENROUTER_MODEL,
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
    temperature=0.2,
    max_tokens=200
)