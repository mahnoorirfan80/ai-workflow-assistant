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
import string
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.utils.tools import save_to_google_docs
import random, string, traceback

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model for chat
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


# Util function to extract text from PDF
def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    pdf_file = BytesIO(pdf_bytes)
    try:
        text = extract_text(pdf_file)
        return text.strip()
    except Exception as e:
        print("Error reading PDF:", str(e))
        return ""

UPLOAD_DIR = "backend/test_files"



@app.post("/upload-resume/")
async def upload_resume(
    file: UploadFile = File(...),
    session_id: str = Form(None)
):
    if not session_id:
        session_id = ''.join(random.choices(string.digits, k=6))

    contents = await file.read()
    text = extract_text_from_pdf_bytes(contents)

    if not text:
        raise HTTPException(status_code=400, detail="Unable to extract text from the uploaded file.")

    # Save raw text for reference
    resume_store[session_id] = text

    try:
        # Step 1: Summarize resume
        summary_response = await agent_with_memory.ainvoke(
            {"input": f"Summarize this resume:\n\n{text}"},
            config={"configurable": {"session_id": session_id}}
        )
        summary = summary_response.get("output", "")

        # Step 2: Save filename for session
        file_state.add_file(session_id, file.filename)

        # ✅ Step 3: Save summary to Google Docs with public link
        doc_url = await save_to_google_docs.ainvoke({"summary": summary, "session_id": session_id})


        # Step 4: Return final response
        return {
            "message": "Resume uploaded and summarized successfully.",
            "session_id": session_id,
            "filename": file.filename,
            "summary": summary,
            "google_docs_link": doc_url  # ✅ this should now appear on frontend
        }

    except Exception as e:
        print("Error during summarization or saving to Docs:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to summarize or save resume.")


@app.get("/resume-history/{session_id}")
def get_resume_history(session_id: str):
    files = file_state.get_all_files(session_id)
    return {"session_id": session_id, "uploaded_files": files}


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


from app.utils.tools import summarize_text


class SummaryRequest(BaseModel):
    text: str

@app.post("/test-summary/")
def test_summary(data: SummaryRequest):
    summary = summarize_text(data.text)
    return {"summary": summary}