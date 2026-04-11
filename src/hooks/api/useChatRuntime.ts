"use client";

import { useState, useCallback, useRef } from "react";
import { AppendMessage, useExternalStoreRuntime } from "@assistant-ui/react";

import { ChatMessage, sendChatMessage } from "@/services/api/chatService";
import { nodeService } from "@/services/api/node.service";
import { NodeType } from "@/types";
import { conversationService } from "@/services/api/conversation.service";




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

  const [conversationId, setConversationId] = useState<string | null>(null);

//Processes a new user message by updating state, calling the agent API, handling the response, and persisting both messages.
const handleNewMessage = useCallback(
  async (message: AppendMessage) => {
    const spaceSlug = "default-space";
    const text = extractText(message.content);

    setIsRunning(true);

    const newMessages = [...messages, message];
    
    setMessages(newMessages);

    try {
    
      let currentConversationId = conversationId;
      const creatingRef = useRef(false);

        if (!currentConversationId && !creatingRef.current) {
            creatingRef.current = true;

          const convo = await conversationService.createConversation(spaceSlug);
          currentConversationId = convo.id;
          setConversationId(convo.id);
          creatingRef.current = false;
}
      // Save user message
      await nodeService.createNode(spaceSlug, {
        title: text.slice(0, 50),
        content: text,
        nodeType: NodeType.REGULAR,
        nodeDetails: {
    conversationId: currentConversationId,
  },
      
      });
      
      //1-Send user text to agent service
      const response = await sendChatMessage(
        mapToBackendMessages(newMessages)
      );

      const assistantText = response.reply;
      //2-Receive response & append to messages
      const assistantMessage = createAssistantMessage(assistantText);

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message (Persist messages as Mujarrad nodes)
      await nodeService.createNode(spaceSlug, {
        title: assistantText.slice(0, 50),
        content: assistantText,
        nodeType: NodeType.REGULAR,
        nodeDetails: {
    conversationId: currentConversationId,
  },
      });

    } catch (error) {
      console.error(error);
    } finally {
      //Manage loading state (isRunning)
      setIsRunning(false);
    }
  },
  [messages]
);

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