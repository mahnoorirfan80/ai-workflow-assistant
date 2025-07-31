# test.py (in backend/)
import os
from dotenv import load_dotenv

# ✅ Load the .env file from the backend folder
load_dotenv()

# ✅ Check if the API key and base URL loaded
assert os.getenv("OPENAI_API_KEY"), "OPENAI_API_KEY not found"
assert os.getenv("OPENAI_BASE_URL"), "OPENAI_BASE_URL not found"

# ✅ Now import the resume workflow function
from app.utils.tools import handle_resume_workflow

# ✅ Set the path to a real PDF resume
file_path = "test_files/resume.pdf"  # Make sure this file exists

# ✅ Call the workflow and print output
result = handle_resume_workflow(file_path)
print(result)
print("KEY:", os.getenv("OPENAI_API_KEY"))  # Debug print
