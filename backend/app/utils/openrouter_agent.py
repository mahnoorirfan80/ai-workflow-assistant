import os
from dotenv import load_dotenv
from typing import Dict

from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.memory import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI

from app.utils.tools import tools  # ✅ All tools imported from one place

# Load API key from .env
load_dotenv()

# === LLM Setup ===
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    temperature=0.7,
)

# === Prompt Template ===
prompt = ChatPromptTemplate.from_messages([
    ("system", "You're a helpful AI assistant."),
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
    if session_id not in memory_store:
        memory_store[session_id] = ChatMessageHistory()
    return memory_store[session_id]

# === Runnable Agent with Memory ===
agent_with_memory: Runnable = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
