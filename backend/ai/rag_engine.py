from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = []
embeddings = []
index = None

def add_document(text):
    emb = model.encode([text])[0]
    documents.append(text)
    embeddings.append(emb)

def build_index():
    global index
    if not embeddings:
        return

    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))

def retrieve(query, k=3):
    if index is None:
        return []

    q_emb = model.encode([query])
    distances, indices = index.search(np.array(q_emb), k)

    return [documents[i] for i in indices[0] if i < len(documents)]