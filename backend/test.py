import requests

URL = "http://127.0.0.1:8000/ask-agent/"
session_id = "test-session-1"  # you can use any string as a session id

def send_message(message):
    response = requests.post(
        URL,
        json={"input": message, "session_id": session_id}
    )
    if response.status_code == 200:
        return response.json()["response"]
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

print("=== TESTING MEMORY ===\n")

messages = [
    "My name is Mahnoor.",
    "What is my name?",
    "I am working on an AI assistant project.",
    "Can you summarize our conversation so far?"
    "I live in Lahore.",
    "Where do I live?",
    "I prefer working in the day.",
    "What are my preferences?",
    "Remind me what we discussed earlier."
]

for msg in messages:
    print(f"User: {msg}")
    reply = send_message(msg)
    if reply:
        print(f"Agent: {reply['output']}\n")
