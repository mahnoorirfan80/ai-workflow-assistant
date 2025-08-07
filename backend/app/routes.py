from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.services.llm_service import get_llm_response

router = APIRouter()

class UserQuery(BaseModel):
    query: str

@router.post("/chat")
async def chat_endpoint(request: UserQuery):
    response = get_llm_response(request.query)
    return {"response": response}
