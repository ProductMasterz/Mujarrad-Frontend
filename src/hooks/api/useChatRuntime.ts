'use client';

import { useState, useCallback, useRef } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { ChatMessage, sendChatMessage } from '@/services/api/chatService';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types';
import { conversationService } from '@/services/api/conversation.service';
import { attributeService } from '@/services/api';
import { AttributeTypeMode } from '@/types/backend-dtos';

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

  return { runtime };
}
