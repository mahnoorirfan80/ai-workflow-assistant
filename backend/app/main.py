# backend/app/main.py

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from app.utils.openrouter_agent import agent_with_memory

app = FastAPI()

class Query(BaseModel):
    input: str
    session_id: str

@app.post("/ask-agent/")
async def ask_agent(query: Query, request: Request):
    try:
        session_id = request.client.host  # Simple session logic by IP
        response = agent_with_memory.invoke({"input": query.input}, config={"configurable": {"session_id": session_id}})
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
