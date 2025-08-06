
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
import os
from dotenv import load_dotenv

#embedding = OpenAIEmbeddings(openai_api_key="sk-")

load_dotenv()
embedding = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

def create_retriever_from_text(session_id: str, text: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)
    docs = [Document(page_content=chunk, metadata={"session_id": session_id}) for chunk in chunks]
    
    persist_path = f"./vector_store/{session_id}"
    os.makedirs(persist_path, exist_ok=True)
    
    db = Chroma.from_documents(docs, embedding, persist_directory=persist_path)
    db.persist()
    return db.as_retriever()

def load_retriever(session_id: str):
    persist_path = f"./vector_store/{session_id}"
    if not os.path.exists(persist_path):
        return None
    db = Chroma(persist_directory=persist_path, embedding_function=embedding)
    return db.as_retriever()
#print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
