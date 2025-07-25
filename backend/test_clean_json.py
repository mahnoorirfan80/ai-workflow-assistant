import os
import json

def clean_chat_file(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    if isinstance(raw_data, list):
        cleaned = []
        for entry in raw_data:
            cleaned.append({
                "type": entry.get("type"),
                "data": {
                    "content": entry["data"].get("content", "")
                }
            })
        key = os.path.basename(file_path).replace(".json", "")
        final_data = {key: cleaned}
    elif isinstance(raw_data, dict):
        final_data = {}
        for session_id, messages in raw_data.items():
            cleaned_msgs = []
            for entry in messages:
                cleaned_msgs.append({
                    "type": entry.get("type"),
                    "data": {
                        "content": entry["data"].get("content", "")
                    }
                })
            final_data[session_id] = cleaned_msgs
    else:
        print("Unrecognized JSON structure.")
        return

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Cleaned: {file_path}")


# ✅ USE THIS TO CLEAN ONE FILE
clean_chat_file("memory_store/test_user_1.json")
