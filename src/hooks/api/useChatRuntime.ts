'use client';

import { useState, useCallback, useRef } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { ChatMessage, sendChatMessage } from '@/services/api/chatService';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types';

//Converts structured message content into plain text.
function extractText(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((p) => p?.text || '').join('');
  }
  return '';
}

//Transforms UI messages into a simplified format for the backend API.
function mapToBackendMessages(messages: AppendMessage[]): ChatMessage[] {
  return messages
    .filter(
      (msg): msg is AppendMessage & { role: 'user' | 'assistant' } =>
        msg.role === 'user' || msg.role === 'assistant'
    )
    .map((msg) => ({
      role: msg.role,
      content: extractText(msg.content),
    }));
}
//Builds a properly structured assistant message object compatible with assistant-ui
function createAssistantMessage(text: string): AppendMessage {
  return {
    role: 'assistant',
    content: [{ type: 'text', text }],
    createdAt: new Date(),
    status: {
      type: 'complete',
      reason: 'stop',
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
  const [conversationNodeId, setConversationNodeId] = useState<string | null>(null);
  const creatingConversationRef = useRef(false);
  const messagesRef = useRef<AppendMessage[]>([]);

  const createConversationNode = async () => {
    const spaceSlug = 'default-space';

    const now = new Date();
    const title = `Chat - ${now.toISOString().slice(0, 16).replace('T', ' ')}`;

    const node = await nodeService.createNode(spaceSlug, {
      title,
      content: title,
      nodeType: NodeType.REGULAR,
      nodeDetails: {
        type: 'conversation',
      },
    });

    return node.id;
  };
  const handleNewMessage = useCallback(
    async (message: AppendMessage) => {
      if (isRunning) return;

      const spaceSlug = 'default-space';
      const text = extractText(message.content);

      setIsRunning(true);

      setMessages((prev) => {
        const updated = [...prev, message];
        messagesRef.current = updated;
        return updated;
      });

      try {
        //  CREATE CONVERSATION NODE
        let convoId = conversationNodeId;

        if (!convoId && !creatingConversationRef.current) {
          creatingConversationRef.current = true;

          try {
            convoId = await createConversationNode();
            setConversationNodeId(convoId);
          } finally {
            creatingConversationRef.current = false;
          }
        }

        // Send chat request
        const response = await sendChatMessage(mapToBackendMessages(messagesRef.current));

        const assistantMessage = createAssistantMessage(response.reply);

        setMessages((prev) => {
          const updated = [...prev, assistantMessage];
          messagesRef.current = updated;
          return updated;
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, conversationNodeId]
  );

  const runtime = useExternalStoreRuntime({
    messages: [...messages],
    isRunning,
    onNew: handleNewMessage,

    convertMessage: (message: AppendMessage, idx: number) => {
      console.log('RUNTIME MESSAGE:', message);
      return {
        id: String(idx),
        role: message.role,
        content: message.content,
      };
    },
  });

  return { runtime };
}
