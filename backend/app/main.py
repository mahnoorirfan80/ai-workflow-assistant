from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from app.utils.openrouter_agent import agent_with_memory
from app.state.file_state import file_state, resume_store
from app.utils.tools import save_to_google_docs  as save_to_google_docs_tool, summarize_text,parse_resume_rag
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from io import BytesIO
from pdfminer.high_level import extract_text
import traceback, random, string, os
from app.state.resume_vector_store import mock_embed_resume, find_similar_resumes
import base64
from pathlib import Path
import json
from docx import Document


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["https://ai-workflow-assistant.vercel.app"],  
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



embeddings_path = Path("backend/app/utils/embeddings.json")
if not embeddings_path.exists():
    embeddings_path.parent.mkdir(parents=True, exist_ok=True)
    with open(embeddings_path, "w") as f:
        json.dump({}, f)


# === Models ===
class Query(BaseModel):
    input: str
    session_id: str

class SummaryRequest(BaseModel):
    text: str

# # === Helper: PDF Extractor ===
# def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
#     pdf_file = BytesIO(pdf_bytes)
#     try:
#         text = extract_text(pdf_file)
#         return text.strip()
#     except Exception as e:
#         print("Error reading PDF:", str(e))
#         return ""

# === Helper: Universal Text Extractor ===
def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Extract text from PDF or DOCX based on file extension.
    """
    ext = filename.lower().split('.')[-1]
    
    try:
        if ext == "pdf":
            pdf_file = BytesIO(file_bytes)
            text = extract_text(pdf_file)
            return text.strip()
        
        elif ext == "docx":
            doc_file = BytesIO(file_bytes)
            document = Document(doc_file)
            text = "\n".join([para.text for para in document.paragraphs])
            return text.strip()
        
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
    
    except Exception as e:
        print(f"Error reading file ({filename}):", str(e))
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
async def upload_resume(file: UploadFile = File(...), session_id: str = Form(None),save_to_google_docs: bool = Form(False) ):
    print(f"[DEBUG] Received save_to_google_docs = {save_to_google_docs} (type: {type(save_to_google_docs)})")
    try:
        # 1. Assign session ID if not provided
        if not session_id:
            session_id = ''.join(random.choices(string.digits, k=6))

        print("File received")
        # 2. Read file contents
        contents = await file.read()

        print("Extracting text...")
        # 3. Extract text from resume
        text = extract_text_from_bytes(contents, file.filename)
        if not text:
            raise HTTPException(status_code=400, detail="Resume is empty or unreadable.")

        mock_embed_resume(session_id, text)
        # 4. Save to in-memory store
        resume_store[session_id] = text
        import time

        def log_step(step):
            print(f"[{time.strftime('%H:%M:%S')}] {step}")
        # 5. Summarize
        print("Extracted text preview:", text[:500])
        summary_response = await agent_with_memory.ainvoke(
            {"input": f"Summarize the following resume:\n\n{text}"},
            config={"configurable": {"session_id": session_id}}
        )
        print("Summarizing...")
       

        log_step("Starting summary...")
        summary = summary_response.get("output", "").strip()
        if not summary or "I don't have the actual content" in summary:
            raise HTTPException(status_code=500, detail="Agent returned invalid summary.")
        
        log_step("Summary complete.")
        # doc_url = await save_to_google_docs.ainvoke({
        #     "summary": summary
        # })
        
        # 6. Conditionally save to Google Docs
        doc_url = None
        print("save_to_google_docs flag:", save_to_google_docs) 
        if save_to_google_docs:
            log_step("Starting Google Docs save...")
            try:
                # Tool expects one arg; pass dict with arg name or just the raw string
                doc_url = await save_to_google_docs_tool.ainvoke({"summary": summary})
                # doc_url = await save_to_google_docs_tool.ainvoke(summary)  # also OK for single-arg tools
                log_step(f"Google Docs save complete: {doc_url}")
            except Exception as e:
                print("Google Docs save failed:", repr(e))
                traceback.print_exc()
                # Optionally: don't fail the whole request; just return no link

        file_state.add_file(session_id, file.filename)
        # if save_to_google_docs:  
        #     log_step("Starting Google Docs save...")
        #     doc_url = await save_to_google_docs.ainvoke({"summary": summary})
        #     log_step(f"Google Docs save complete: {doc_url}")

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


@app.get("/health")
def health():
    return {"ok": True}