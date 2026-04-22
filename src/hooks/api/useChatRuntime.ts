'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { ChatMessage, sendChatMessage } from '@/services/api/chatService';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types';
import { conversationService } from '@/services/api/conversation.service';
import { attributeService } from '@/services/api';
import { AttributeKey, AttributeTypeMode } from '@/types/backend-dtos';

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

  const [conversationId, setConversationId] = useState<string | null>(null);
  const creatingRef = useRef(false);
const [conversationCache, setConversationCache] = useState<
  Record<string, AppendMessage[]>
>({});
  
  
const loadConversationHistory = useCallback(
  async (conversationId: string) => {
    const spaceSlug = 'default-space';

    try {
      const attributes = await attributeService.getNodeAttributes(
        conversationId,
        { attributeType: AttributeKey.CONTAINS }
      );

      if (!attributes.length) {
        setMessages([]);
        return;
      }

      const messageNodeIds = attributes.map(
        (attr) => attr.targetNodeId
      );

    
      const nodes = await Promise.all(
        messageNodeIds.map((id) =>
          nodeService.getNode(spaceSlug, id)
        )
      );

      nodes.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

      const historyMessages: AppendMessage[] = nodes.map((node) => ({
        role: node.title === 'agent-message' ? 'assistant' : 'user',
        content: [{ type: 'text', text: node.content || '' }],
        createdAt: new Date(node.createdAt),
        status: { type: 'complete', reason: 'stop' },
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
      }));

      setMessages(historyMessages);

      setConversationCache((prev) => ({
        ...prev,
        [conversationId]: historyMessages,
      }));
    } catch (error) {
      console.error('Failed to load history', error);
    }
  },
  []
);

const switchConversation = useCallback(
  async (id: string) => {
    setConversationId(id);

    // instant load from cache 
    if (conversationCache[id]) {
      setMessages(conversationCache[id]);
      return;
    }

    setMessages([]);
    await loadConversationHistory(id);
  },
  [conversationCache, loadConversationHistory]
);
 /* useEffect(() => {
    if (!conversationId) return;

    // Prevent overwriting current session messages
    //if (messages.length > 0) return;

    loadConversationHistory(conversationId);
  }, [conversationId, loadConversationHistory, messages.length]);*/

  //Processes a new user message by updating state, calling the agent API, handling the response, and persisting both messages.
  const handleNewMessage = useCallback(
    async (message: AppendMessage) => {
      const spaceSlug = 'default-space';
      const text = extractText(message.content);

      setIsRunning(true);

      const newMessages = [...messages, message];
      setMessages(newMessages);

      try {
        let currentConversationId = conversationId;

        // Create conversation once

        if (!currentConversationId) {
          if (creatingRef.current) return;

          creatingRef.current = true;

          const convo = await conversationService.createConversation(spaceSlug);

          currentConversationId = convo.id;
          setConversationId(convo.id);

          creatingRef.current = false;
        }

        //Create USER message node

        const userNode = await nodeService.createNode(spaceSlug, {
          title: 'user-message',
          content: text,
          nodeType: NodeType.REGULAR,
          nodeDetails: {
            type: 'message',
            role: 'user',
          },
        });

        // Link USER → CONVERSATION
        await attributeService.createAttribute(userNode.id, {
          sourceNodeId: currentConversationId!,
          targetNodeId: userNode.id,
          attributeType: 'contains',
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: 'contains',
          attributeValue: {},
        });

        //  Call backend AI

        const response = await sendChatMessage(mapToBackendMessages(newMessages));
        const assistantText = response.reply;

        //  Create ASSISTANT message node

        const assistantNode = await nodeService.createNode(spaceSlug, {
          title: 'agent-message',
          content: assistantText,
          nodeType: NodeType.REGULAR,
          nodeDetails: {
            type: 'message',
            role: 'assistant',
          },
        });

        //  Link ASSISTANT → CONVERSATION

        await attributeService.createAttribute(assistantNode.id, {
          sourceNodeId: currentConversationId!,
          targetNodeId: assistantNode.id,
          attributeType: 'contains',
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: 'contains',
          attributeValue: {},
        });

        //UI
        const assistantMessage = createAssistantMessage(assistantText);
        setMessages((prev) => [...prev, assistantMessage]);
        setConversationCache((prev) => ({
        ...prev,
        [currentConversationId!]: [...newMessages, assistantMessage],
      }));
      } catch (error) {
        console.error(error);
      } finally {
        setIsRunning(false);
      }
    },
    [messages, conversationId]
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

  const startNewConversation = useCallback(async () => {
  const spaceSlug = 'default-space';

  setMessages([]);
  creatingRef.current = true;

  try {
    const convo = await conversationService.createConversation(spaceSlug);
    setConversationId(convo.id);
  } finally {
    creatingRef.current = false;
  }
}, []);

  return { runtime,startNewConversation ,switchConversation, conversationId};
}
