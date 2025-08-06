import hashlib
import json
from pathlib import Path

CACHE_PATH = Path("backend/app/utils/embeddings.json")

def _hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def load_embedding(text: str) -> list | None:
    if not CACHE_PATH.exists():
        return None
    with open(CACHE_PATH, "r") as f:
        data = json.load(f)
    return data.get(_hash(text))

def save_embedding(text: str, embedding: list):
    data = {}
    if CACHE_PATH.exists():
        with open(CACHE_PATH, "r") as f:
            data = json.load(f)
    data[_hash(text)] = embedding
    with open(CACHE_PATH, "w") as f:
        json.dump(data, f)
