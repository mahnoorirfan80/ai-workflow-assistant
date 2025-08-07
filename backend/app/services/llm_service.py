from app.agent_logic import run_agent

def get_llm_response(user_input: str) -> str:
    return run_agent(user_input)
