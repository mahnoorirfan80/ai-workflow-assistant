import os
import json
from typing import List
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict

# Directory where memory files will be stored
MEMORY_DIR = "memory_store"
os.makedirs(MEMORY_DIR, exist_ok=True)

class PersistentChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str):
        self.file_path = os.path.join(MEMORY_DIR, f"{session_id}.json")
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w") as f:
                json.dump([], f)

    @property
    def messages(self) -> List[BaseMessage]:
        if not os.path.exists(self.file_path):
            return []
        with open(self.file_path, "r") as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    return []
                return messages_from_dict(data)
            except json.JSONDecodeError:
                return []

    def add_message(self, message: BaseMessage) -> None:
        messages = self.messages
        messages.append(message)
        with open(self.file_path, "w") as f:
            json.dump(messages_to_dict(messages), f, indent=2)

    def clear(self):
        with open(self.file_path, "w") as f:
            json.dump([], f, indent=2)
