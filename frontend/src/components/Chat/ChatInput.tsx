import { useState } from 'react';
<<<<<<< HEAD
import { Send } from 'lucide-react';
=======
import { Send, Paperclip } from 'lucide-react';
>>>>>>> backup-working-code
import axios from "axios";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
<<<<<<< HEAD
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false); // separate loader for file upload
=======
  const [isUploading, setIsUploading] = useState(false);
>>>>>>> backup-working-code

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
<<<<<<< HEAD
      const response = await axios.post("http://localhost:8000/upload-resume/", formData, {
=======
      const response = await axios.post("http://localhost:3000/upload-resume/", formData, {
>>>>>>> backup-working-code
        headers: { "Content-Type": "multipart/form-data" },
      });

      const summary = response.data.summary;
<<<<<<< HEAD

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
=======
      const gdoc = response.data.google_docs_link;
      const docUrl = gdoc.match(/\((https:\/\/docs\.google\.com\/[^\)]+)\)/)?.[1];
      const markdownMessage = `###  Resume Summary\n${summary}\n\n🔗 [View in Google Docs](${docUrl})`;

      
      alert(" Resume processed. Summary available in chat.");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(" Failed to summarize document.");
>>>>>>> backup-working-code
    } finally {
      setIsUploading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full gap-2 px-4 py-3 bg-white"
    >
      <input
        type="text"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading || isUploading}
        className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
      type="file"
      id="file-upload"
      accept=".pdf,.doc,.docx"
      onChange={handleFileUpload}
      className="hidden"/>
      {/* 📎 Clip Icon as File Upload Button */}
      <label
        htmlFor="file-upload"
        className="cursor-pointer p-2 rounded-md bg-blue-100 hover:bg-blue-200 transition border-2 border-blue-500"
      >
        📎
      </label>
      <button
        type="submit"
        disabled={isLoading || isUploading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
      >
        <Send size={16} />
      </button>
    </form>
  );
  }
>>>>>>> backup-working-code
