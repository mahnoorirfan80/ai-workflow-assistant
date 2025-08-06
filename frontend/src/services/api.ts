import axios from 'axios';


const API_BASE_URL = 'http://localhost:8000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SendMessageRequest {
  user_input: string;
}

export interface SendMessageResponse {
  output: string;
}

export interface UploadResumeResponse {
  message: string;
  session_id: string;
  filename: string;
  summary: string;
  google_docs_link: string; 
}


// Send message to the AI agent
export const sendMessage = async (prompt: string, sessionId: string): Promise<SendMessageResponse> => {
  const response = await api.post<SendMessageResponse>('/ask-agent/', {
    input: prompt,            
    session_id: sessionId, 
  });
  return response.data;
};

// Upload resume for parsing
export const uploadResume = async (file: File): Promise<UploadResumeResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<UploadResumeResponse>('/upload-resume/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;