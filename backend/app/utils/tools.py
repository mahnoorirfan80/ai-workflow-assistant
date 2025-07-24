from datetime import datetime
from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from notion_client import Client
import os
<<<<<<< HEAD
import json
from langchain_core.tools import tool
=======

>>>>>>> 350ab73784d086f556c4ee794ba2375ffe8751d1

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

@tool
def summarize_text(text: str) -> str:
    """Returns a short summary of the provided text."""
    if len(text) < 20:
        return "Please provide more text to summarize."
    return f"Summary: {text[:75]}..."

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
def save_to_notion(text: str) -> str:
    """Saves the provided text as a new page in Notion."""
    if len(text) < 10:
        return "Please provide more content to save."

    notion_token = os.getenv("NOTION_TOKEN")
    database_id = os.getenv("NOTION_DATABASE_ID")
    
    if not notion_token or not database_id:
        return "Notion credentials are missing."

    notion = Client(auth=notion_token)

    try:
        response = notion.pages.create(
            parent={"database_id": database_id},
            properties={
                "Name": {
                    "title": [
                        {"text": {"content": text[:30]}}
                    ]
                }
            },
            children=[
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": text}}]
                    },
                }
            ]
        )
        return f"Text saved to Notion page: {response['url']}"
    except Exception as e:
        return f" Failed to save to Notion: {str(e)}"


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


<<<<<<< HEAD
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

=======
>>>>>>> 350ab73784d086f556c4ee794ba2375ffe8751d1
tools = [
    get_current_datetime,
    simple_math,
    summarize_text,
    get_weather,
    scrape_website,
    save_to_notion,
<<<<<<< HEAD
    get_calendar_events,
    clear_memory
=======
    get_calendar_events
>>>>>>> 350ab73784d086f556c4ee794ba2375ffe8751d1
]