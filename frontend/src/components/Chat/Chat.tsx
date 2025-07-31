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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // ✅ Correct initialization
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
      // ✅ Pass both text and sessionId
      const response = await sendMessage(text, sessionId.current);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.output,
        isUser: false,
        timestamp: new Date(),
      };

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

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
