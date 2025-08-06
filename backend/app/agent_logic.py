from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.agents import initialize_agent, AgentType
from langchain_core.tools import Tool
import json

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model="gpt-4-turbo",
    temperature=0.7,
    api_key=openai_api_key
)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


def dummy_tool(input: str) -> str:
    return f"Tool processed: {input}"

tools = [
    Tool(
        name="DummyTool",
        func=dummy_tool,
        description="Processes user input using a dummy tool",
    ),
]

agent = initialize_agent(
    tools, llm, agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION, memory=memory, verbose=True
)

def run_agent(input_text: str) -> str:
    return agent.run(input_text)


def format_agent_response(parsed_data, summary_text, doc_link):
    return json.dumps({
        "parsed": parsed_data,
        "summary": summary_text,
        "google_docs_link": doc_link,
        "status": "saved"
    }, indent=2)
