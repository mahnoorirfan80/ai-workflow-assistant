from datetime import datetime
from langchain.tools import tool

@tool
def get_current_datetime(dummy_input: str) -> str:
    """Returns the current date and time."""
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S")

@tool
def simple_math(query: str) -> str:
    """Evaluates simple math expressions."""
    try:
        result = eval(query, {"__builtins__": {}})
        return str(result)
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
    """Returns weather information for a given city (dummy data)."""
    return f"The current weather in {city} is 30°C with clear skies."

# ✅ Export tools as a list
tools = [get_current_datetime, simple_math, summarize_text, get_weather]
