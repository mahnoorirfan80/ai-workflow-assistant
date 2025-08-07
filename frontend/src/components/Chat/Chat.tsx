import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendMessage } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Workflow Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [resumeOutput, setResumeOutput] = useState<null | {
    parsed: any;
    summary: string;
    google_docs_link: string;
  }>(null);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const sessionId = useRef<string>(Math.floor(Math.random() * 100000).toString());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
  const response = await sendMessage(text, sessionId.current);
  const raw = response.output;

  let assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    text: raw,
    isUser: false,
    timestamp: new Date(),
  };



<<<<<<< HEAD
  // Try parsing response to JSON (if it's the resume pipeline response)
  try {
    const parsedJson = JSON.parse(raw);

    // If it's the structured resume result, extract and store
=======

  try {
    const parsedJson = JSON.parse(raw);

>>>>>>> backup-working-code
    if (parsedJson.status === "saved") {
      setResumeOutput({
        parsed: parsedJson.parsed,
        summary: parsedJson.summary,
        google_docs_link: parsedJson.google_docs_link,
      });
<<<<<<< HEAD

      // Replace assistant message with more readable summary if needed
      assistantMessage.text = "✅ Resume processed. Summary and parsed data are displayed below.";
    }
  } catch (err) {
    // Not JSON, fallback to showing as plain text
=======
      assistantMessage.text = "Resume processed. Summary and parsed data are displayed below.";
    }
  } catch (err) {
    
>>>>>>> backup-working-code
  }

  setMessages(prev => [...prev, assistantMessage]);
}
     catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-2">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.text}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex gap-2 p-4">
              <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300" />
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-300" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {resumeOutput && (
  <div className="mt-4 p-4 border rounded-md bg-white space-y-4 text-sm">
    <h2 className="text-lg font-semibold">📄 Resume Summary</h2>
    <div className="whitespace-pre-wrap">{resumeOutput.summary}</div>

    <h3 className="font-semibold pt-2">📋 Parsed Details</h3>
    <ul className="list-disc list-inside">
      {Object.entries(resumeOutput.parsed).map(([key, value]) => (
        <li key={key}>
          <strong>{key}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
        </li>
      ))}
    </ul>

    <div>
      <a
        href={resumeOutput.google_docs_link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        📎 View in Google Docs
      </a>
    </div>
  </div>
)}

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
=======
return (
  <div className="chat-container h-full flex flex-col">
    {/* Scrollable Chat Messages */}
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <div className="space-y-2">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex gap-2 p-4">
            <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300" />
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-150" />
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-300" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {resumeOutput && (
        <div className="mt-4 p-4 border rounded-md bg-white space-y-4 text-sm">
          <h2 className="text-lg font-semibold">📄 Resume Summary</h2>
        
          <h3 className="font-semibold pt-2">📋 Parsed Details</h3>
          <ul className="list-disc list-inside">
            {Object.entries(resumeOutput.parsed).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
              </li>
            ))}
          </ul>
          
        </div>
      )}
    </div>

    {/* Fixed Input Area */}
    <div className="chat-input-container border-t bg-background">
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  </div>
);
>>>>>>> backup-working-code
}
