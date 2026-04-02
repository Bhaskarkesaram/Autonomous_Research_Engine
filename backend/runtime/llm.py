import requests

OPENROUTER_API_KEY = "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"  # 🔥 replace

def call_llm(prompt: str):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }

    response = requests.post(url, headers=headers, json=data)

    result = response.json()

    return result["choices"][0]["message"]["content"]