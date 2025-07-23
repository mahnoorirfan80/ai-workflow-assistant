# backend/test_memory.py

import requests

API_URL = "http://127.0.0.1:8000/ask-agent/"
SESSION_ID = "test-memory-001"

def send_message(message):
    response = requests.post(API_URL, json={
        "input": message,
        "session_id": SESSION_ID
    })
    return response.json()["response"]

print("=== TESTING MEMORY ===")
print("User: My name is Mahnoor.")
reply1 = send_message("My name is Mahnoor.")
print("Assistant:", reply1)

print("\nUser: What is my name?")
reply2 = send_message("What is my name?")
print("Assistant:", reply2)

print("\nUser: What did I tell you earlier?")
reply3 = send_message("What did I tell you earlier?")
print("Assistant:", reply3)

print("\n=== STARTING A NEW SESSION ===")
NEW_SESSION_ID = "test-memory-002"

response_new = requests.post(API_URL, json={
    "input": "What is my name?",
    "session_id": NEW_SESSION_ID
})
print("New session assistant:", response_new.json()["response"])
