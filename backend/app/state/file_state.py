from collections import defaultdict

resume_store = {}
class FileState:
    def __init__(self):
        # Dictionary mapping session_id to list of uploaded file paths
        self.uploaded_files_by_session = defaultdict(list)

    def add_file(self, session_id: str, file_path: str):
        self.uploaded_files_by_session[session_id].append(file_path)

    def get_last_file(self, session_id: str):
        if session_id in self.uploaded_files_by_session:
            return self.uploaded_files_by_session[session_id][-1]
        return None

    def get_all_files(self, session_id: str):
        return self.uploaded_files_by_session.get(session_id, [])

# Instantiate globally
file_state = FileState()
