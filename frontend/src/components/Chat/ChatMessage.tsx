import React from 'react';
import { marked } from 'marked';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div
      className={`p-3 rounded-md max-w-3xl ${
        isUser ? 'bg-blue-100 self-end text-right' : 'bg-gray-100 self-start text-left'
      }`}
    >
     {isUser ? (
  <p className="whitespace-pre-wrap">{message}</p>
) : (
  <div
    className="prose prose-sm max-w-none whitespace-pre-wrap"
    dangerouslySetInnerHTML={{
      __html: marked.parse(typeof message === 'string' ? message : JSON.stringify(message)),
    }}
  />
)}
      <div className="text-xs text-gray-400 mt-1">
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
