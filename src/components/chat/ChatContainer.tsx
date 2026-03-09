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
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      const response: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: "Agent response placeholder.",
      };

      setMessages((prev) => [...prev, response]);
    }, 500);
  };

  return (
    <div className="flex h-full w-full max-w-3xl flex-col border bg-white shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}