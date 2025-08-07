# backend/app/state/resume_vector_store.py

import random


# In-memory fake vector store (dictionary of session_id to tags)
resume_vectors = {}

def mock_embed_resume(session_id: str, resume_text: str):
    """Simulate embedding by assigning fake tags based on keywords."""
    tags = []
    if "machine learning" in resume_text.lower():
        tags.append("ML")
    if "python" in resume_text.lower():
        tags.append("Python")
    if "react" in resume_text.lower():
        tags.append("Frontend")
    if not tags:
        tags.append(random.choice(["General", "Entry-Level", "Intern"]))

    resume_vectors[session_id] = tags

def find_similar_resumes(query_tags: list):
    """Simulate vector search by matching tags."""
    results = []
    for sid, tags in resume_vectors.items():
        if any(tag in tags for tag in query_tags):
            results.append({"session_id": sid, "tags": tags})
    return results
