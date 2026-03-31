"use client";

import { AssistantRuntimeProvider, ThreadMessage } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react-ui";
import { useChatRuntime } from "@/hooks/api/useChatRuntime";
import "./chat.css";
import { MarkdownMessage } from "./MarkdownMessage";

function normalizeContent(content: any): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content.map((p) => p?.text ?? "").join("");
  }

  return "";
}

export function ChatWindow() {
  const { runtime } = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div >
        <div >
          Chat Assistant
        </div>
        <div >
       <Thread
            components={{
             AssistantMessage: (props: any) => {
              const message = props?.message;

              if (!message || !message.content) return null;

              return (
                <div className="aui-assistant-message-root">
                  <div className="aui-assistant-message-content">
                    <div className="aui-text">
                      
                      <MarkdownMessage content={normalizeContent(message.content)} />
                    </div>
                  </div>
                </div>
              );
            }

            
            }}
          />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}