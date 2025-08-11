from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from app.utils.openrouter_agent import agent_with_memory
from app.state.file_state import file_state, resume_store
from app.utils.tools import save_to_google_docs, summarize_text,parse_resume_rag
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from io import BytesIO
from pdfminer.high_level import extract_text
import traceback, random, string, os
from app.state.resume_vector_store import mock_embed_resume, find_similar_resumes
import base64

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI()

# Enable CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Models ===
class Query(BaseModel):
    input: str
    session_id: str

class SummaryRequest(BaseModel):
    text: str

# === Helper: PDF Extractor ===
def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    pdf_file = BytesIO(pdf_bytes)
    try:
        text = extract_text(pdf_file)
        return text.strip()
    except Exception as e:
        print("Error reading PDF:", str(e))
        return ""

# === ROUTES ===
@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


@app.post("/ask-agent/")
async def ask_agent(query: Query): 
    try:
        session_id = query.session_id or ''.join(random.choices(string.digits, k=6))
        response = await agent_with_memory.ainvoke(
            {"input": query.input},
            config={"configurable": {"session_id": session_id}}
        )
        print("Agent output:", response["output"])
        return {"output": response["output"]}

    except Exception as e:
        print("Agent error:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to get agent response.")


@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...), session_id: str = Form(None)):
    try:
        # 1. Assign session ID if not provided
        if not session_id:
            session_id = ''.join(random.choices(string.digits, k=6))

        print("File received")
        # 2. Read file contents
        contents = await file.read()

        print("Extracting text...")
        # 3. Extract text from resume
        text = extract_text_from_pdf_bytes(contents)
        if not text:
            raise HTTPException(status_code=400, detail="Resume is empty or unreadable.")

        mock_embed_resume(session_id, text)
        # 4. Save to in-memory store
        resume_store[session_id] = text

        # 5. Summarize
        summary_response = await agent_with_memory.ainvoke(
            {"input": f"Summarize the following resume:\n\n{text}"},
            config={"configurable": {"session_id": session_id}}
        )
        print("Summarizing...")
        summary = summary_response.get("output", "").strip()
        if not summary or "I don't have the actual content" in summary:
            raise HTTPException(status_code=500, detail="Agent returned invalid summary.")
        
        doc_url = await save_to_google_docs.ainvoke({
            "content": summary
        })

       

        # 7. Store file metadata
        file_state.add_file(session_id, file.filename)

        # 8. Respond
        return {
            "message": "Resume uploaded and summarized successfully.",
            "session_id": session_id,
            "filename": file.filename,
            "summary": summary,
            "google_docs_link": doc_url
        }

    except Exception as e:
        print("Resume upload error:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to process and summarize the resume.")

@app.get("/resume-history/{session_id}")
def get_resume_history(session_id: str):
    files = file_state.get_all_files(session_id)
    return {"session_id": session_id, "uploaded_files": files}

@app.post("/test-summary/")
def test_summary(data: SummaryRequest):
    summary = summarize_text(data.text)
    print("All done!")
    return {"summary": summary}
