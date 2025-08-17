from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os
import pickle

# If modifying scopes, delete token.json first
SCOPES = ["https://www.googleapis.com/auth/documents"]

def main():
    creds = None
    if os.path.exists("token.json"):
        print("token.json already exists. Delete it if you want to regenerate.")
        return

    flow = InstalledAppFlow.from_client_secrets_file(
        "credentials.json", SCOPES
    )
    creds = flow.run_local_server(port=0)

    with open("token.json", "w") as token:
        token.write(creds.to_json())

    print("✅ token.json created successfully.")

if __name__ == "__main__":
    main()
