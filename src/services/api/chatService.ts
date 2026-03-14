export type ChatMessage = {
  
  role: "user" | "assistant";
  content: string;
};

export async function sendChatMessage(messages: ChatMessage[]) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat response");
  }

  return response.json();
}

/**
 * sendChatMessage(messages)
        ↓
    POST /api/chat
 */