"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    // Immediate optimistic UI update
    setMessages((prev) => [...prev, userMessage]);

    // Temporary simulated agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: "Agent response placeholder.",
      };

      setMessages((prev) => [...prev, agentMessage]);
    }, 600);
  };

  return (
    <div className="flex h-full w-full flex-col">

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}