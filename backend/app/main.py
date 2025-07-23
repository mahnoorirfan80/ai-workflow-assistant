from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.utils.openrouter_agent import agent_with_memory
import traceback

app = FastAPI()

class Query(BaseModel):
    input: str
    session_id: str

@app.post("/ask-agent/")
async def ask_agent(query: Query):
    try:
        response = agent_with_memory.invoke(
            {"input": query.input},
            config={"configurable": {"session_id": query.session_id}}
        )
        return {"response": response}
    except Exception as e:
        print("❌ Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
