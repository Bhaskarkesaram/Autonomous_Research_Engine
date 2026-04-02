import os
from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

# 🔥 LOAD ENV (FIX 1)
load_dotenv()

# 🔍 DEBUG (optional)
print("DB_NAME:", os.getenv("DB_NAME"))

# 🔐 SAFE ENV READ
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")

if not mongo_uri or not db_name:
    raise ValueError("❌ MONGO_URI or DB_NAME not set in .env")

# 🔗 DB CONNECTION
client = MongoClient(mongo_uri)
db = client[db_name]

collection = db["vector_docs"]

# 🔥 LOAD MODEL (FIX 2)
model = SentenceTransformer("all-MiniLM-L6-v2")


# ==========================
# STORE DOCUMENT
# ==========================
def store_document(text, user):
    embedding = model.encode(text).tolist()

    collection.insert_one({
        "text": text,
        "embedding": embedding,
        "user": user
    })


# ==========================
# SEARCH SIMILAR
# ==========================
def search_similar(query, user, k=3):
    query_embedding = model.encode(query).tolist()

    results = collection.aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": k,
                "filter": {"user": user}
            }
        }
    ])


    return [doc["text"] for doc in results]