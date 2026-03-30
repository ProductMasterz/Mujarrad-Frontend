"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react-ui";
import { useChatRuntime } from "@/hooks/api/useChatRuntime";
import "./chat.css";

export function ChatWindow() {
  const { runtime } = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="chat-page">
        <div className="chat-header">
          Chat Assistant
        </div>

        <div className="chat-body">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}