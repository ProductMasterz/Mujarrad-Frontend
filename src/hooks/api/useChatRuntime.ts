"use client";

import { useState, useCallback, useRef } from "react";
import { AppendMessage, useExternalStoreRuntime } from "@assistant-ui/react";

import { ChatMessage, sendChatMessage } from "@/services/api/chatService";
import { nodeService } from "@/services/api/node.service";
import { NodeType } from "@/types";

//Converts structured message content into plain text.
function extractText(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => p?.text || "").join("");
  }
  return "";
}

//Transforms UI messages into a simplified format for the backend API.
function mapToBackendMessages(messages: AppendMessage[]): ChatMessage[] {
  return messages
    .filter(
      (msg): msg is AppendMessage & { role: "user" | "assistant" } =>
        msg.role === "user" || msg.role === "assistant"
    )
    .map((msg) => ({
      role: msg.role,
      content: extractText(msg.content),
    }));
}
//Builds a properly structured assistant message object compatible with assistant-ui
function createAssistantMessage(text: string): AppendMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    createdAt: new Date(),
    status: {
      type: "complete",
      reason: "stop",
    },
    metadata: {
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
    parentId: null,
    sourceId: null,
    runConfig: undefined,
  };
}
//Manages chat state, handles message flow, and connects the UI to the agent service via a custom runtime.
export function useChatRuntime() {
  const [messages, setMessages] = useState<AppendMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const messagesRef = useRef<AppendMessage[]>([]);

  const handleNewMessage = useCallback(async (message: AppendMessage) => {
    if (isRunning) return;

    const spaceSlug = "default-space";
    const text = extractText(message.content);

    setIsRunning(true);

    setMessages((prev) => {
      const updated = [...prev, message];
      messagesRef.current = updated;
      return updated;
    });

    try {
      await nodeService.createNode(spaceSlug, {
        title: text.slice(0, 50),
        content: text,
        nodeType: NodeType.REGULAR,
      });

      await new Promise((res) => setTimeout(res, 300));

      const response = await sendChatMessage(
        mapToBackendMessages(messagesRef.current)
      );

      const assistantMessage = createAssistantMessage(response.reply);

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        messagesRef.current = updated;
        return updated;
      });

      await nodeService.createNode(spaceSlug, {
        title: response.reply.slice(0, 50),
        content: response.reply,
        nodeType: NodeType.REGULAR,
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  const runtime = useExternalStoreRuntime({
    messages: [...messages],
    isRunning,
    onNew: handleNewMessage,

    convertMessage: (message: AppendMessage, idx: number) => {

      console.log("RUNTIME MESSAGE:", message);
      return {
        id: String(idx),
        role: message.role,
        content: message.content,
      };
    },
  });

  return { runtime };
}