import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

model_name = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct")
response = client.chat.completions.create(
    model=model_name,
    messages=[
        {"role": "user", "content": "Say hello"}
    ],
)

print(response.choices[0].message.content)