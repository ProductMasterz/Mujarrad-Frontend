import { ChatMessage, sendChatMessage } from "@/services/api/chatService";
import { useState } from "react";


export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! How can I help?" }
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      setLoading(true);

      const data = await sendChatMessage(updatedMessages);

      const botMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    loading,
  };
}