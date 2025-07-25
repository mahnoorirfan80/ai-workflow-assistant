import os
from dotenv import load_dotenv
from typing import Dict
from app.utils.persistent_memory import PersistentChatMessageHistory
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.chat_message_histories import ChatMessageHistory
#from langchain.memory import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI
from app.utils.tools import tools  


# Load API key from .env
load_dotenv()
print("🔑 OPENAI_API_KEY loaded:", os.getenv("OPENAI_API_KEY"))

# === LLM Setup ===
# llm = ChatOpenAI(
#     model="gpt-4.1-mini",
#     openai_api_base="https://openrouter.ai/api/v1",
#     openai_api_key=os.getenv("OPENROUTER_API_KEY"),
#     temperature=0.7,
# )


llm = ChatOpenAI(
    model="gpt-4-turbo",  # ✅ Update this line
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.7,
)


prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "You're a helpful AI assistant. You have access to the following tools:\n"
     "- get_current_datetime: Returns the current date and time.\n"
     "- simple_math: Solves basic math expressions.\n"
     "- summarize_text: Summarizes long pieces of text.\n"
     "- get_weather: Returns weather info for a city (dummy data).\n" 
     "- scrape_website: Extracts and summarizes content from a given URL.\n"
     "- save_to_notion: Saves text summaries or links into your Notion database.\n"
     "- get_calendar_events: Fetches upcoming calendar events (real-time).\n"
     "- parse_resume: Extracts name, email, phone, skills, education, and experience from a resume PDF already located in the test_files folder (no need to upload).\n"
     "Use these tools only when needed and explain your reasoning."
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# === Agent with Tool Calling ===
agent = create_tool_calling_agent(llm, tools, prompt)

# === Agent Executor with Tool List ===
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# === In-Memory Session Store ===
memory_store: Dict[str, ChatMessageHistory] = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    return PersistentChatMessageHistory(session_id=session_id)

# === Runnable Agent with Memory ===
agent_with_memory: Runnable = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
