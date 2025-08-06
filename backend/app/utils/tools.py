from datetime import datetime
import requests
from bs4 import BeautifulSoup
from notion_client import Client
import os
import json
from langchain_core.tools import tool
import pdfplumber
import re
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from langchain_openai import ChatOpenAI 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable
from app.state.file_state import file_state 
from typing import Optional
from langchain_core.runnables import RunnableConfig
from app.state.file_state import resume_store
from .embedding_store import load_embedding, save_embedding
from .rag_store import create_retriever_from_text
from io import BytesIO
import docx2txt
from pdfminer.high_level import extract_text
from fastapi import UploadFile

from dotenv import load_dotenv
load_dotenv()
USE_MOCK = False

@tool
def get_current_datetime(dummy_input: str) -> str:
    """Returns the current date and time."""
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S")

@tool
def simple_math(query: str) -> str:
    """Evaluates simple math expressions like 2 + 2 or 5 * (3 + 1)."""
    try:
        result = eval(query, {"__builtins__": {}})
        return f"The result of {query} is {result}."
    except Exception as e:
        return f"Math error: {str(e)}"


llm = ChatOpenAI(
    model="gpt-4-turbo",  
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    openai_api_base=os.getenv("OPENAI_BASE_URL"),
    temperature=0.7,
)

print("USE_MOCK =", USE_MOCK)
@tool
def summarize_text(text: str) -> str:

    """
    Summarizes resume text using GPT and formats it in clean Markdown with clear sections:
    Name, Contact, LinkedIn, Education, Experience, Projects, Technical Skills.
    Uses cache if summary already exists.
    """
    if USE_MOCK:
        print("MOCK MODE ACTIVE — skipping OpenRouter call.")
        return "This is a mock summary of the resume."

 
    cached = load_embedding(text)
    if cached:
        return cached

    try:
        llm = ChatOpenAI(
            model="gpt-4-turbo",
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_api_base=os.getenv("OPENAI_BASE_URL"),
            timeout=30
        )

        prompt = ChatPromptTemplate.from_template("""
    You are an expert resume summarizer and formatter.

    Your task is to read raw resume content and generate a clean, **concise summary** in **Markdown format**, using the following **section headers**:

    ## Name & Contact
    ## Mail                                              
    ## LinkedIn  
    ## Education  
    ## Experience  
    ## Projects  
    ## Technical Skills

    **Instructions:**
    - Summarize long paragraphs into short bullet points.
    - Be concise but retain key achievements, skills, and experiences.
    - Use **bold titles** and bullet points (one line per bullet).
    - Extract LinkedIn URL from the resume and place it under the 'LinkedIn' section.
    - Add line breaks between sections.
    - No explanation, no front-matter — return only the Markdown.

    Resume:
    {text}
    """)


        chain: Runnable = prompt | llm

        print("Starting summary generation...")
        response = chain.invoke({"text": text})
        result = response.content if hasattr(response, 'content') else str(response)

        print("Summary generation complete.")
        # Save result to cache
        save_embedding(text, result)
        return result

    except Exception as e:
        print("Error during summarization:", str(e))
        return f"Error in summarization: {str(e)}"



@tool
def get_weather(city: str) -> str:
    """Returns weather information for a given city (dummy output)."""
    return f"The current weather in {city} is 30°C with clear skies."


@tool
def scrape_website(url: str) -> str:
    """Scrapes the given website and returns its visible text content."""
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.content, "html.parser")

       
        for tag in soup(["script", "style"]):
            tag.decompose()

        text = soup.get_text(separator=' ', strip=True)
        safe_limit = min(len(text), 8000)  
        return f"Website content from {url}:\n\n{text[:safe_limit]}..."

    except Exception as e:
        return f"Failed to scrape website: {str(e)}"

@tool
def get_calendar_events(dummy_input: str) -> str:
    """Returns upcoming calendar events (dummy data)."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    return (
        f"Upcoming events:\n"
        f"- {now} – Team meeting\n"
        f"- {now} – Submit project update\n"
        f"- {now} – AI workshop session"
    )


@tool
def clear_memory(session_id: str) -> str:
    """Clear the memory for a specific user session."""
    file_path = os.path.join("memory_store", f"{session_id}.json")
    if os.path.exists(file_path):
        with open(file_path, "w") as f:
            json.dump([], f, indent=2)
        return f"Memory cleared for session: {session_id}"
    else:
        return f"No memory file found for session: {session_id}"
    


@tool
def parse_resume(session_id: str) -> dict:
    """Parse and summarize the uploaded resume based on session_id."""
    try:
        if session_id not in resume_store:
            return {"error": "Missing session_id or resume not uploaded."}

        resume_text = resume_store[session_id]

        # Simulate summary
        summary = f"Resume Summary for session {session_id}:\n" + resume_text[:300]

        # Extract fields
        name_match = re.search(r'(?i)Name[:\s]*([A-Z][a-z]+\s[A-Z][a-z]+)', resume_text)
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', resume_text)
        phone_match = re.search(r'\+?\d[\d\s\-]{9,}', resume_text)

        name = name_match.group(1) if name_match else None
        email = email_match.group() if email_match else None
        phone = phone_match.group() if phone_match else None

        # Extract sections
        skills, education, experience = [], [], []
        current_section = None

        for line in resume_text.splitlines():
            line = line.strip()
            if re.search(r'(?i)^skills?', line):
                current_section = "skills"
                continue
            elif re.search(r'(?i)^education', line):
                current_section = "education"
                continue
            elif re.search(r'(?i)^experience', line):
                current_section = "experience"
                continue

            if current_section == "skills":
                skills.append(line)
            elif current_section == "education":
                education.append(line)
            elif current_section == "experience":
                experience.append(line)

        return {
            "summary": summary,
            "name": name,
            "email": email,
            "phone": phone,
            "skills": [s for s in skills if s],
            "education": [e for e in education if e],
            "experience": [x for x in experience if x],
        }

    except Exception as e:
        return {"error": str(e)}



@tool
def parse_resume_rag(file_bytes_b64: str, session_id: str = "default_session") -> str:
    """Extracts and saves resume content for later Q&A from a base64 string."""
    import base64
    from io import BytesIO
    from pdfminer.high_level import extract_text
    import docx2txt

    try:
        file_bytes = base64.b64decode(file_bytes_b64)
        ext = "pdf" 

        if ext == "pdf":
            text = extract_text(BytesIO(file_bytes))
        elif ext in ["doc", "docx"]:
            text = docx2txt.process(BytesIO(file_bytes))
        else:
            return "Unsupported file type"

        create_retriever_from_text(session_id, text)
        summary = summarize_text(text)
        return f"Resume parsed and saved. Summary:\n{summary}"

    except Exception as e:
        return f"Error parsing resume: {str(e)}"


SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive.file"
]

@tool
def save_to_google_docs(content: str) -> str:
    """Saves the given content to a new Google Doc and returns the doc link."""

    creds = None
    creds_path = os.path.join("app", "config", "credentials.json")
    
    
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
        creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    # Create Google Docs API service
    service = build('docs', 'v1', credentials=creds)

    # Create the document
    doc = service.documents().create(body={"title": "AI Assistant Summary"}).execute()
    doc_id = doc.get('documentId')

    # Insert text into the document
    service.documents().batchUpdate(
        documentId=doc_id,
        body={
            'requests': [
                {'insertText': {
                    'location': {'index': 1},
                    'text': content
                }}
            ]
        }
    ).execute()

    # Return the document link
    return f"https://docs.google.com/document/d/{doc_id}/edit"



@tool
def handle_resume_workflow(session_id: str) -> str:
    """
    Parses the resume uploaded in the current session, summarizes the extracted content, 
    and saves the summary to a Google Docs document.

    Args:
        session_id (str): Unique identifier for the user's session, used to retrieve the uploaded resume.

    Returns:
        str: A JSON-formatted string containing:
            - parsed: Extracted key-value data from the resume.
            - summary: A summarized version of the parsed resume.
            - google_docs_link: Link to the saved Google Docs document.
            - status: 'saved' if successful, or error details if failed.
    """
    try:
        file_path = file_state.get_last_file(session_id)
        if not file_path or not os.path.exists(file_path):
            return json.dumps({
                "status": "failed",
                "error": "No resume uploaded for this session."
            })

        parsed_data = parse_resume(session_id)
        if not parsed_data:
            return json.dumps({
                "status": "failed",
                "error": "Failed to parse resume."
            })

        full_text = json.dumps(parsed_data, indent=2)
        summary = "🧪 Mock summary for resume." if USE_MOCK else summarize_text(full_text)
        doc_link = save_to_google_docs(summary)

        result = {
            "parsed": parsed_data,
            "summary": summary,
            "google_docs_link": doc_link,
            "status": "saved"
        }

        return json.dumps(result)

    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": str(e)
        })



@tool
def scrape_and_summarize(url: str):
    """Scrape the given URL and return a summarized version of its content."""
    html = scrape_website(url)
    summary = summarize_text(html)
    return summary


tools =[
    get_current_datetime,
    simple_math,
    summarize_text,
    get_weather,
    scrape_website,
    get_calendar_events,
    clear_memory,
    parse_resume,
    parse_resume_rag,
    save_to_google_docs,
    handle_resume_workflow,
    scrape_and_summarize
]