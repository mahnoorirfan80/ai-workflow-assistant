import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-lg space-y-2 ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            isUser
              ? 'bg-chat-user text-white ml-auto'
              : 'bg-chat-assistant text-foreground'
          }`}
        >
          {message}
        </div>
        
        {timestamp && (
          <p className={`text-xs text-muted-foreground ${isUser ? 'text-right' : ''}`}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}