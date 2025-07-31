from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from app.utils.openrouter_agent import agent_with_memory
import traceback
import os
import shutil
from app.state.file_state import file_state 
from app.state.file_state import resume_store
import random
from io import BytesIO
from pdfminer.high_level import extract_text
import random
import string
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    input: str
    session_id: str

@app.post("/ask-agent/")
async def ask_agent(query: Query):
    try:
        response = await agent_with_memory.ainvoke(
            {"input": query.input},  
            config={"configurable": {"session_id": query.session_id}} 
        )
        print("Agent output:", response["output"])

        return {"output": response["output"]} 
    except Exception as e:
        print("Full traceback:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



UPLOAD_DIR = "backend/test_files"
def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    return "Parsed resume content"

@app.post("/upload-resume/")
async def upload_resume(
    file: UploadFile = File(...),
    session_id: str = Form(None)
):
    if not session_id:
        session_id = ''.join(random.choices(string.digits, k=3))

    contents = await file.read()
    text = extract_text_from_pdf_bytes(contents)
    resume_store[session_id] = text

    return {"message": "Resume uploaded successfully.", "session_id": session_id}


@app.get("/resume-history/{session_id}")
def get_resume_history(session_id: str):
    files = file_state.get_all_files(session_id)
    return {"session_id": session_id, "uploaded_files": files}


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


