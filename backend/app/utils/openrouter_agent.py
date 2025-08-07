import os
from dotenv import load_dotenv
from typing import Dict

# LangChain Core
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_openai import ChatOpenAI

# Your App Tools & State
from app.utils.persistent_memory import PersistentChatMessageHistory
from app.utils.tools import tools
from app.state.file_state import file_state, resume_store

# === Load .env FIRST ===
load_dotenv(dotenv_path="backend/.env")
api_key = os.getenv("OPENAI_API_KEY")
use_mock = os.getenv("USE_MOCK", "true").lower() == "true"

print(f" OPENAI_API_KEY loaded: {api_key}")
print(f" USE_MOCK = {use_mock}")

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

# === Session memory store ===
memory_store: Dict[str, ChatMessageHistory] = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    return PersistentChatMessageHistory(session_id=session_id)

# === MOCK MODE ===
if use_mock or not api_key:
    print(" Using MOCK agent_with_memory")

    class MockAgentExecutor:
        async def ainvoke(self, input_dict, config=None):
            print("MOCK agent invoked with input:", input_dict)
            return {"output": "This is a mocked response."}

    agent_with_memory = MockAgentExecutor()

# === REAL AGENT MODE ===
else:
    print("Using REAL agent_with_memory")

    llm = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4"),
        openai_api_key=api_key,
        openai_api_base=os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1"),
        temperature=0.5,
    )

    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    agent_with_memory = RunnableWithMessageHistory(
        agent_executor,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
    )
