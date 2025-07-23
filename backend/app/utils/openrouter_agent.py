# backend/app/utils/openrouter_agent.py

import os
from dotenv import load_dotenv
from typing import Dict

from langchain.agents import tool, AgentExecutor, create_tool_calling_agent
from langchain.memory import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import Runnable
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

from app.utils.tools import get_current_datetime, simple_math, summarize_text

# Load environment variables
load_dotenv()

# === LLM Setup ===
llm = ChatOpenAI(
    model="openrouter/openai/gpt-3.5-turbo",
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1",
)

# === Tools Setup ===
tools = [get_current_datetime, simple_math, summarize_text]

# === Prompt Template ===
prompt = ChatPromptTemplate.from_messages([
    ("system", "You're a helpful AI assistant."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# === Create Agent ===
agent = create_tool_calling_agent(llm, tools, prompt)

# === Agent Executor ===
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# === Memory Store ===
# Dictionary to keep per-session memory in memory
memory_store: Dict[str, ChatMessageHistory] = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in memory_store:
        memory_store[session_id] = ChatMessageHistory()
    return memory_store[session_id]

# === Agent with Memory ===
agent_with_memory: Runnable = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
