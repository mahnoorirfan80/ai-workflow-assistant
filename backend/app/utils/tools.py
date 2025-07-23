from datetime import datetime
from langchain.tools import tool
import requests
from bs4 import BeautifulSoup

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
        return f"Website content from {url}:\n\n{text[:1000]}..."  # Limit for token safety
    except Exception as e:
        return f"Failed to scrape website: {str(e)}"

@tool
def save_to_notion(text: str) -> str:
    """Pretend to save a note to Notion (simulated)."""
    # Real implementation would use Notion API
    if len(text) < 10:
        return "Please provide more content to save."
    return f"Saved to Notion: {text[:100]}..."

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


tools = [
    get_current_datetime,
    simple_math,
    summarize_text,
    get_weather,
    scrape_website,
    save_to_notion,
    get_calendar_events
]