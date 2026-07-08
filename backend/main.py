from fastapi import FastAPI, HTTPException, Form, Request, UploadFile, File, Depends, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import List, Optional

import json, os, asyncio, re, random

from backend.graph.nodes import research_node
from backend.tools.file_processor import extract_file_content
from io import BytesIO

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError

from passlib.context import CryptContext

from datetime import datetime, timedelta

from backend.services.sms_service import send_sms_otp
# ==========================
# ENV
# ==========================
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")

app = FastAPI()


# ==========================
# SETTINGS
# ==========================

MAX_FILE_SIZE = 10 * 1024 * 1024

MAX_QUERY_LENGTH = 5000


# ==========================
# AUTH SETTINGS
# ==========================

SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "nexora-secret-key"
)

ALGORITHM = "HS256"

security = HTTPBearer()


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(
    password,
    hashed
):
    return pwd_context.verify(
        password,
        hashed
    )


def create_token(email):

    payload = {
        "sub": email,
        "exp":
        datetime.utcnow()
        +
        timedelta(days=7)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_user(
    credentials:
    HTTPAuthorizationCredentials
    =
    Depends(security)
):

    try:

        data = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return data["sub"]

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    

# ==========================
# STREAM TOKEN VERIFY
# ==========================

def verify_stream_token(
    token: str
):

    try:

        data = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return data["sub"]


    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid stream token"
        )
    
    
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

user_collection = None

otp_collection = None


@app.on_event("startup")
def connect_db():
    global client, db, chat_collection, user_collection, otp_collection

    if not MONGO_URI:
        print("⚠ MONGO_URI not found")
        return

    if not DB_NAME:
        print("⚠ DB_NAME not found")
        return

    try:
        client = MongoClient(
            MONGO_URI,
            maxPoolSize=5,
            serverSelectionTimeoutMS=5000
        )

        # Verify connection
        client.admin.command("ping")

        db = client[DB_NAME]
        chat_collection = db["chats"]
        user_collection = db["users"]
        otp_collection = db["otp"]

        print("✅ MongoDB Connected")

    except Exception as e:
        print("❌ MongoDB Connection Error:", str(e))


@app.on_event("shutdown")
def close_db():
    global client

    if client:
        client.close()
# ==========================
# MODEL
# ==========================
class ChatRequest(BaseModel):
    conversations: list

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


class LoginRequest(BaseModel):
    identifier: str
    password: str

latest_query = {}
document_memory = {}

@app.post("/send-otp")
async def send_otp(
    data: RegisterRequest
):

    existing = user_collection.find_one(
        {
            "$or":[
                {"email":data.email},
                {"phone":data.phone}
            ]
        }
    )


    if existing:
        raise HTTPException(
            400,
            "User already exists"
        )


    otp = str(
        random.randint(
            100000,
            999999
        )
    )


    otp_collection.update_one(
        {
            "email":data.email
        },
        {
            "$set":{
                "name":data.name,
                "email":data.email,
                "phone":data.phone,
                "password":
                hash_password(
                    data.password
                ),
                "otp":otp,
                "expires":
                datetime.utcnow()
                +
                timedelta(minutes=5)
            }
        },
        upsert=True
    )


    send_sms_otp(
      data.phone,
      otp
    )


    return {
        "message":
        "OTP sent"
    }

@app.post("/verify-register")
async def verify_register(
    data:VerifyOTPRequest
):


    record = otp_collection.find_one(
        {
            "email":data.email
        }
    )


    if not record:

        raise HTTPException(
            400,
            "OTP expired"
        )
    
    if record["expires"] < datetime.utcnow():

     otp_collection.delete_one(
        {
            "email":
            data.email
        }
     )


     raise HTTPException(
        400,
        "OTP expired"
     )


    if record["otp"] != data.otp:

        raise HTTPException(
            400,
            "Invalid OTP"
        )



    user_collection.insert_one(
        {
            "name":
            record["name"],

            "email":
            record["email"],

            "phone":
            record["phone"],

            "password":
            record["password"],

            "phoneVerified":
            True,

            "createdAt":
            datetime.utcnow()
        }
    )



    otp_collection.delete_one(
        {
            "email":
            data.email
        }
    )


    token=create_token(
        record["email"]
    )


    return {

        "name":
        record["name"],

        "email":
        record["email"],

        "token":
        token

    }


@app.post("/login")
async def login(
    data:LoginRequest
):


    user = user_collection.find_one(
        {
            "$or":[

                {
                    "email":
                    data.identifier
                },

                {
                    "phone":
                    data.identifier
                }

            ]
        }
    )



    if(
        not user
        or
        not verify_password(
            data.password,
            user["password"]
        )
    ):


        raise HTTPException(
            401,
            "Invalid login"
        )



    return {

        "name":
        user["name"],

        "email":
        user["email"],

        "token":
        create_token(
            user["email"]
        )

    }

# ==========================
# QUERY API
# ==========================
@app.post("/query")
async def query(
    request: Request,
    query: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
    user: str = Depends(get_user)
):
    print("FILES =", files)

    try:
        

        if len(query) > MAX_QUERY_LENGTH:
            raise HTTPException(
                status_code=400,
                detail="Query exceeds maximum length"
            )

        documents = []

        if files:
            for file in files:

                raw = await file.read()

                if len(raw) > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400,
                        detail=f"{file.filename} exceeds size limit"
                    )

                extracted = extract_file_content(
                    file.filename,
                    BytesIO(raw)
                )

                documents.append({
                    "name": file.filename,
                    "content": extracted
                })

                print(
                    f"✅ Processed File: {file.filename}"
                )

        print("DOCUMENTS =", documents)

        # ==================================
        # CLEAR DOCUMENT MEMORY COMMAND
        # ==================================
        if query.lower() in [
            "clear document",
            "clear documents",
            "forget document",
            "forget documents"
        ]:

            document_memory[user] = []

            latest_query[user] = {
                "query": query,
                "documents": []
            }

            print("🗑 Document memory cleared")

            return {
                "status": "ok"
            }

        # ==================================
        # SAVE DOCUMENTS TO MEMORY
        # ==================================
        if documents:

            document_memory[user] = documents

            print(
                "📄 Saved documents to memory:",
                len(documents)
            )

        latest_query[user] = {
            "query": query,
            "documents": documents
        }

        return {
            "status": "ok"
        }

    except HTTPException:
        raise

    except Exception as e:
        print("QUERY ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# ==========================
# STREAM API
# ==========================
@app.get("/stream")
async def stream(
    token: str = Query(...)
):


    user = verify_stream_token(
        token
    )


    async def event_generator():
        try:
            data = latest_query.get(user, {})
            
            query = data.get("query", "")
            documents = data.get("documents", [])

            # ==================================
            # USE SAVED DOCUMENT MEMORY
            # ==================================
            if not documents:

                documents = document_memory.get(user, [])

            latest_query[user] = {}

            print("STREAM DOCUMENTS =", len(documents))
            

            if not query and not documents:
                yield f"data: {json.dumps({'done': True})}\n\n"
                return


            # =========================
            # AGENT STATUS
            # =========================

            yield f"data: {json.dumps({'type':'thinking','content':'🧠 Planning Research...'})}\n\n"
            await asyncio.sleep(0.2)

            yield f"data: {json.dumps({'type':'thinking','content':'🌐 Searching Sources...'})}\n\n"
            await asyncio.sleep(0.2)

            yield f"data: {json.dumps({'type':'thinking','content':'✅ Validating Sources...'})}\n\n"
            await asyncio.sleep(0.2)

            yield f"data: {json.dumps({'type':'thinking','content':'📊 Generating Report...'})}\n\n"
            await asyncio.sleep(0.2)

            loop = asyncio.get_running_loop()

            print("STREAM DOCUMENTS =", documents)
            result = await loop.run_in_executor(
                None,
                lambda: research_node(
                    {
                        "user_request": query,
                        "documents": documents,
                        "execution_log": []
                    }
                )
            )

            final_text = result.get(
                "final_output",
                ""
            )

            if not final_text:
                final_text = "⚠ No response generated"

            # =========================
            # CLEAN FORMATTING
            # =========================

            final_text = re.sub(
                r"\[\d+\]",
                "",
                final_text
            )

            final_text = re.sub(
                r"(📌 Overview)",
                r"\n\n📌 Overview\n\n",
                final_text
            )

            final_text = re.sub(
                r"(🔍 Key Concepts)",
                r"\n\n🔍 Key Concepts\n\n",
                final_text
            )

            final_text = re.sub(
                r"(🧠 Detailed Explanation)",
                r"\n\n🧠 Detailed Explanation\n\n",
                final_text
            )

            final_text = re.sub(
                r"(📊 Advantages)",
                r"\n\n📊 Advantages\n\n",
                final_text
            )

            final_text = re.sub(
                r"(⚠️ Limitations)",
                r"\n\n⚠️ Limitations\n\n",
                final_text
            )

            final_text = re.sub(
                r"(📈 Applications)",
                r"\n\n📈 Applications\n\n",
                final_text
            )

            final_text = re.sub(
                r"(📈 Real-World Applications)",
                r"\n\n📈 Real-World Applications\n\n",
                final_text
            )

            final_text = re.sub(
                r"(✅ Summary)",
                r"\n\n✅ Summary\n\n",
                final_text
            )

            final_text = re.sub(
                r"(📚 Sources)",
                r"\n\n📚 Sources\n\n",
                final_text
            )

            final_text = final_text.replace(
                "• ",
                "\n• "
            )

            final_text = re.sub(
                r"(https?://\S+)",
                r"\n\1",
                final_text
            )

            final_text = re.sub(
                r"\n{3,}",
                "\n\n",
                final_text
            )

            final_text = final_text.strip()

            # =========================
            # STREAM RESPONSE
            # =========================

            for chunk in re.findall(
              r'.{1,40}',
             final_text,
              flags=re.DOTALL
            ):

             yield f"data: {json.dumps({'token': chunk})}\n\n"

             await asyncio.sleep(0.01)

            yield f"data: {json.dumps({'type':'thinking','content':''})}\n\n"

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:

            print("STREAM ERROR:", e)

            yield f"data: {json.dumps({'type':'thinking','content':''})}\n\n"

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
async def save_chat(
    data: ChatRequest,
    user:str = Depends(get_user)
):

    if not chat_collection:
        return {
            "success": False,
            "message": "MongoDB not connected"
        }

    try:
        chat_collection.update_one(
            {"user": user},
            {
                "$set": {
                    "conversations": data.conversations
                }
            },
            upsert=True
        )

        return {
            "success": True
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ==========================
# GET CHAT
# ==========================
@app.get("/get-chats")
async def get_chats(
    user:str = Depends(get_user)
):

    if not chat_collection:
        return {
            "conversations": []
        }

    try:
        doc = chat_collection.find_one(
            {"user": user}
        )

        return {
            "conversations":
                doc["conversations"]
                if doc else []
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

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