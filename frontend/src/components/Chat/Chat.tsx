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
      text: "Hello! I'm your AI Workflow Assistant. How can I help you today?",
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

      try {
        const parsedJson = JSON.parse(raw);

        if (parsedJson.status === "saved") {
          setResumeOutput({
            parsed: parsedJson.parsed,
            summary: parsedJson.summary,
            google_docs_link: parsedJson.google_docs_link,
          });
          assistantMessage.text = "Resume processed. Summary and parsed data are displayed below.";
        }
      } catch (err) {}

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
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

  const predefinedQueries = [
    "Generate a daily to-do list",
    "Help me brainstorm project ideas",
    "Tell me the latest news in tech",
    "Debug this code snippet",
    "Create a study plan for exams",
  ];

  const handleEnhancePrompt = (currentPrompt: string) => {
    if (!currentPrompt.trim()) return;
    // Simple enhancement: prepend "Make this professional and detailed: "
    return `Make this professional and detailed: ${currentPrompt}`;
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Response copied to clipboard!',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy text.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="chat-container h-full flex flex-col">
      {/* Predefined Quick Queries */}
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        {predefinedQueries.map((query, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(query)}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded-full"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Scrollable Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="relative group">
              <ChatMessage
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
              {!msg.isUser && (
                <button
                  onClick={() => handleCopy(msg.text)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-xs px-2 py-1 bg-gray-200 rounded"
                >
                  Copy
                </button>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 p-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-gray-500">Processing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {resumeOutput && (
          <div className="mt-4 p-4 border rounded-md bg-white space-y-4 text-sm">
            <h2 className="text-lg font-semibold">📄 Resume Summary</h2>
            <p>{resumeOutput.summary}</p>
            <h3 className="font-semibold pt-2">📋 Parsed Details</h3>
            <ul className="list-disc list-inside">
              {Object.entries(resumeOutput.parsed).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong>{" "}
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="chat-input-container border-t bg-background p-2 flex items-center gap-2">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <button
          onClick={() => {
            const lastUserMessage = messages.filter(m => m.isUser).pop();
            if (lastUserMessage) {
              const enhanced = handleEnhancePrompt(lastUserMessage.text);
              if (enhanced) handleSendMessage(enhanced);
            }
          }}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={isLoading}
        >
          Enhance Prompt
        </button>
      </div>
    </div>
  );
}
