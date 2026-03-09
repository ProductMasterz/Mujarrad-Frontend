"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { processText } from "@/services/agentService";

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
    };

    // Show message immediately
    setMessages((prev) => [...prev, userMessage]);

    try {

        const result = await processText(text, "demo-space");

        const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: result.report || "Processing complete.",
        };

        setMessages((prev) => [...prev, agentMessage]);

    } catch (error) {

        const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: "⚠️ Agent service unavailable.",
        };

        setMessages((prev) => [...prev, errorMessage]);

    }
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