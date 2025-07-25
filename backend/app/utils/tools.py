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
from langchain.tools import tool
from langchain.tools import tool
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable

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
    temperature=0.5,
)

@tool
def summarize_text(text: str) -> str:
    """
    Summarize the given text using GPT model via OpenRouter.
    """
    try:
        llm = ChatOpenAI(
            model="gpt-4.1-mini",  # or "openrouter/gpt-4.1-mini" if that works for you
            temperature=0.5,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_api_base=os.getenv("OPENAI_BASE_URL"),
        )

        prompt = ChatPromptTemplate.from_template(
            "Summarize this information in 5 bullet points:\n{text}"
        )

        chain: Runnable = prompt | llm

        response = chain.invoke({"text": text})
        return response.content.strip()

    except Exception as e:
        print("🔥 Error during summarization:", str(e))
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

        # Remove script/style content
        for tag in soup(["script", "style"]):
            tag.decompose()

        text = soup.get_text(separator=' ', strip=True)
        safe_limit = min(len(text), 8000)  # To avoid index errors
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
def parse_resume(file_path: str) -> dict:
    """Parses a resume PDF file and extracts name, email, phone, skills, education, and experience."""

    name, email, phone = "", "", ""
    skills, education, experience = [], [], []

    with pdfplumber.open(file_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"

    # Basic info
# Basic info
    name_match = re.search(r'(?i)Name[:\s]*([A-Z][a-z]+\s[A-Z][a-z]+)', full_text)
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', full_text)
    phone_match = re.search(r'\+?\d[\d\s\-]{9,}', full_text)

    name = name_match.group(1) if name_match else None
    email = email_match.group() if email_match else None
    phone = phone_match.group() if phone_match else None


    if name_match:
        name = name_match.group()
    if email_match:
        email = email_match.group()
    if phone_match:
        phone = phone_match.group()

    # Section parsing (improve keywords + logic)
    current_section = None
    for line in full_text.split("\n"):
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
        "name": name,
        "email": email,
        "phone": phone,
        "skills": [s for s in skills if s],
        "education": [e for e in education if e],
        "experience": [x for x in experience if x],
    }



SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive.file']

@tool
def save_to_google_docs(content: str) -> str:
    """Saves the given content to a new Google Doc and returns the doc link."""

    creds = None
    creds_path = os.path.join("app", "config", "credentials.json")
    
    # Load credentials from token or generate new one
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
def handle_resume_workflow(file_path: str) -> str:
    """
    Complete resume workflow: Parse → Summarize → Save to Google Docs.
    Returns structured JSON with links and status.
    """
    try:
        # Step 1: Parse resume
        parsed_data = parse_resume(file_path)
        if not parsed_data:
            return json.dumps({
                "status": "failed",
                "error": "Failed to parse resume."
            })

        # Step 2: Summarize parsed content
        full_text = json.dumps(parsed_data, indent=2)
        summary = summarize_text(full_text)

        # Step 3: Save summary to Google Docs
        doc_link = save_to_google_docs(summary)

        # Step 4: Return structured response
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


tools =[
    get_current_datetime,
    simple_math,
    summarize_text,
    get_weather,
    scrape_website,
    get_calendar_events,
    clear_memory,
    get_calendar_events,
    parse_resume,
    save_to_google_docs,
    handle_resume_workflow
]