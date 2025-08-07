from fastapi import APIRouter, Request
from app.services.llm_service import get_llm_response

router = APIRouter()

@router.get("/")
def root():
    return {"message": "AI Workflow Assistant is running."}

@router.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_input = body.get("message", "")
    if not user_input:
        return {"error": "No input provided."}
    
    response = get_llm_response(user_input)
    return {"response": response}
