from app.utils.openrouter_agent import agent_with_memory

# Simulate unique session ID (creates: memory_store/test_user_1.json)
session_id = "test_user_1"

def send_message(message: str):
    return agent_with_memory.invoke(
        {"input": message},
        config={"configurable": {"session_id": session_id}}  # ✅ REQUIRED!
    )

print("=== TESTING PERSISTENT MEMORY ===")

reply1 = send_message("My name is Mahnoor.")
print("User: My name is Mahnoor.")
print("Agent:", reply1["output"])

reply2 = send_message("What is my name?")
print("\nUser: What is my name?")
print("Agent:", reply2["output"])

reply3 = send_message("What tools can you use?")
print("\nUser: What tools can you use?")
print("Agent:", reply3["output"])
