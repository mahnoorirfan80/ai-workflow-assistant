import json
import datetime

def log_upload(username, file_path):
    log_data = {
        "user": username,
        "path": file_path,
        "timestamp": datetime.datetime.now().isoformat()
    }
    with open("backend/test_files/log.json", "a") as log_file:
        log_file.write(json.dumps(log_data) + "\n")
