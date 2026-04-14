from fastapi import FastAPI, HTTPException, Form, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import List, Optional

import json, os, asyncio, re

from backend.graph.nodes import research_node

# ==========================
# ENV
# ==========================
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

app = FastAPI()

# ==========================
# CORS
# ==========================
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

latest_query = {}

# ==========================
# QUERY API
# ==========================
@app.post("/query")
async def query(
    request: Request,
    query: str = Form(...),
    files: Optional[List[UploadFile]] = File(None)
):
    try:
        user = "guest"

        if files:
            for file in files:
                await file.read()

        latest_query[user] = query
        return {"status": "ok"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================
# STREAM API
# ==========================
@app.get("/stream")
async def stream():
    user = "guest"

    async def event_generator():
        try:
            query = latest_query.get(user, "")
            latest_query[user] = ""

            if not query:
                yield f"data: {json.dumps({'done': True})}\n\n"
                return

            loop = asyncio.get_event_loop()

            result = await loop.run_in_executor(
                None,
                lambda: research_node({"user_request": query})
            )

            final_text = result.get("final_output", "")

            if not final_text:
                final_text = "⚠ No response generated"

            # =========================
            # 🔥 CLEAN FORMATTING ONLY
            # =========================

            # remove [1][2]
            final_text = re.sub(r"\[\d+\]", "", final_text)

            # section spacing (VERY IMPORTANT)
            final_text = re.sub(r"(📌 Overview)", r"\n\n📌 Overview\n\n", final_text)
            final_text = re.sub(r"(🔍 Key Concepts)", r"\n\n🔍 Key Concepts\n\n", final_text)
            final_text = re.sub(r"(🧠 Detailed Explanation)", r"\n\n🧠 Detailed Explanation\n\n", final_text)
            final_text = re.sub(r"(📊 Advantages)", r"\n\n📊 Advantages\n\n", final_text)
            final_text = re.sub(r"(⚠️ Limitations)", r"\n\n⚠️ Limitations\n\n", final_text)
            final_text = re.sub(r"(📈 Real-World Applications)", r"\n\n📈 Real-World Applications\n\n", final_text)
            final_text = re.sub(r"(✅ Summary)", r"\n\n✅ Summary\n\n", final_text)
            final_text = re.sub(r"(📚 Sources)", r"\n\n📚 Sources\n\n", final_text)

            # bullet spacing
            final_text = final_text.replace("• ", "\n• ")

            # paragraph spacing
            final_text = re.sub(r"\.\s+", ".\n\n", final_text)

            # links spacing
            final_text = re.sub(r"(https?://\S+)", r"\n\1", final_text)

            # clean extra spaces
            final_text = re.sub(r"\n{3,}", "\n\n", final_text)

            final_text = final_text.strip()

            # =========================
            # RESPONSE
            # =========================
            yield f"data: {json.dumps({'token': final_text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'token': '❌ Error: ' + str(e)})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# ==========================
# SAVE CHAT
# ==========================
@app.post("/save-chat")
async def save_chat(data: ChatRequest):
    chat_collection.update_one(
        {"user": "guest"},
        {"$set": {"conversations": data.conversations}},
        upsert=True
    )
    return {"success": True}

# ==========================
# GET CHAT
# ==========================
@app.get("/get-chats")
async def get_chats():
    doc = chat_collection.find_one({"user": "guest"})
    return {"conversations": doc["conversations"] if doc else []}

# ==========================
# ROOT
# ==========================
@app.get("/")
async def root():
    return {"message": "🚀 Groq Fast Research Backend Running"}

# ==========================
# HEALTH
# ==========================
@app.get("/health")
def health():
    return {"status": "ok"}