
from fastapi import FastAPI, HTTPException, Form, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv

import PyPDF2
import pytesseract
from PIL import Image
import io, time, json, os

from backend.ai.vector_db import store_document, search_similar
from backend.ai.agents import route_agent, build_agent_prompt
from backend.ai.fact_check import fact_check
from backend.runtime.executor import DeepCognitiveExecutor

# ==========================
# ENV
# ==========================
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# DB
# ==========================
client = None
db = None
chat_collection = None

@app.on_event("startup")
def connect_db():
    global client, db, chat_collection
    client = MongoClient(MONGO_URI, maxPoolSize=5)
    db = client[DB_NAME]
    chat_collection = db["chats"]

@app.on_event("shutdown")
def close_db():
    if client:
        client.close()

# ==========================
# MODEL
# ==========================
class ChatRequest(BaseModel):
    conversations: list

# ==========================
# EXECUTOR
# ==========================
executor = DeepCognitiveExecutor()
latest_query = {}

# ==========================
# CLEAN OUTPUT FORMATTER
# ==========================
def format_output(text: str):
    if not text:
        return ""

    # remove junk symbols
    text = text.replace("=", "").replace("-", "")

    # fix duplicate headings
    text = text.replace("### 🔍 Insights ** ### 🔍 Key Insights", "### 🔍 Key Insights")
    text = text.replace("### 🔍 Insights ### 🔍 Key Insights", "### 🔍 Key Insights")

    # normalize headings
    text = text.replace("📌 Research Output:", "\n### 📌 Overview\n")
    text = text.replace("🔍 Analysis Output:", "\n### 🔍 Key Insights\n")
    text = text.replace("Patterns", "\n### 📊 Patterns")
    text = text.replace("Final Summary", "\n### ✅ Summary")

    return text.strip()

# ==========================
# QUERY (FAST RESPONSE)
# ==========================
@app.post("/query")
async def query(request: Request, query: str = Form(...)):
    try:
        user = "guest"

        form = await request.form()
        files = form.getlist("files")

        # 📄 FILE PROCESSING
        for file in files:
            content = await file.read()

            if file.filename.endswith(".pdf"):
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    text = page.extract_text() or ""
                    store_document(text, user)

            elif file.filename.endswith((".png", ".jpg", ".jpeg")):
                image = Image.open(io.BytesIO(content))
                text = pytesseract.image_to_string(image)
                store_document(text, user)

        # 🧠 AI PIPELINE
        context_docs = search_similar(query, user)
        agent = route_agent(query)

        final_prompt = build_agent_prompt(agent, query, context_docs)
        latest_query[user] = final_prompt

        # ⚡ FAST PREVIEW
        preview_result = executor.run(final_prompt, detailed=False)
        preview = preview_result.get("final_output", "")

        clean_preview = format_output(preview)

        check = fact_check(preview, context_docs)

        return {
            "response": clean_preview[:200],
            "confidence": check["confidence"],
            "agent": agent,
            "status": "streaming"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================
# STREAM (NO MIXING + FAST)
# ==========================
@app.get("/stream")
async def stream():
    user = "guest"

    def generator():
        query = latest_query.get(user)

        # ✅ FIX 1: Don't send "No query found"
        if not query:
            return

        try:
            # ✅ Run executor
            result = executor.run(query, detailed=False)

            clean_text = format_output(result.get("final_output", ""))

            # ✅ Preserve formatting
            lines = clean_text.split("\n")

            chunk_size = 3

            for i in range(0, len(lines), chunk_size):
                chunk = "\n".join(lines[i:i + chunk_size])

                data = json.dumps({"token": chunk + "\n"})
                yield f"data: {data}\n\n"

            # ✅ Send done signal
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            print("STREAM ERROR:", e)

            yield f"data: {json.dumps({'token': 'Error occurred'})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        # ✅ FIX 2: Reset properly
        latest_query[user] = None

    return StreamingResponse(generator(), media_type="text/event-stream")
# ==========================
# CHAT STORAGE
# ==========================
@app.post("/save-chat")
async def save_chat(data: ChatRequest):
    chat_collection.update_one(
        {"user": "guest"},
        {"$set": {"conversations": data.conversations}},
        upsert=True
    )
    return {"success": True}

@app.get("/get-chats")
async def get_chats():
    doc = chat_collection.find_one({"user": "guest"})
    return {"conversations": doc["conversations"] if doc else []}

# ==========================
# ROOT
# ==========================
@app.get("/")
async def root():
    return {"message": "🚀 Clean + Fast Backend Running"}
