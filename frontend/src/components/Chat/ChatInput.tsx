import { useState } from 'react';
import { Send } from 'lucide-react';
import axios from "axios";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false); // separate loader for file upload

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/upload-resume/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const summary = response.data.summary;

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: `Uploaded document: ${file.name}` },
        { role: "assistant", content: summary },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Failed to summarize document." },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-container flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="textarea textarea-no-resize min-h-11 max-h-32 flex-1"
          disabled={isLoading || isUploading}
          style={{ resize: 'none' }}
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="btn btn-icon btn-gradient transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="file-input"
      />
    </form>
  );
}
