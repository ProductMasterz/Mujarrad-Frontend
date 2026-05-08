'use client';

import { useState, useCallback, useRef } from 'react';
import { AppendMessage, useExternalStoreRuntime } from '@assistant-ui/react';

import { ChatMessage, sendChatMessage } from '@/services/api/chatService';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types';
import { useEffect } from 'react';

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
// LinkMessageConverstationNode associates a message node with a conversation node in the backend.
async function linkMessageToConversation(conversationId: string, messageNodeId: string) {
  await fetch(`/api/nodes/${conversationId}/attributes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetNodeId: messageNodeId,
      type: 'CONTAINS',
    }),
  });
}

function toAppendMessage(node: any): AppendMessage {
  return {
    role: node.nodeDetails.role,
    content: [{ type: 'text', text: node.content }],
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
  };
}

//Manages chat state, handles message flow, and connects the UI to the agent service via a custom runtime.
export function useChatRuntime() {
  const [messages, setMessages] = useState<AppendMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [conversationNodeId, setConversationNodeId] = useState<string | null>(null);
  const creatingConversationRef = useRef(false);
  const messagesRef = useRef<AppendMessage[]>([]);


  const [conversations, setConversations] = useState<Node[]>([]);

  const loadConversationHistory = async (conversationId: string): Promise<AppendMessage[]> => {
    const spaceSlug = 'default-space';

    const allNodes = await nodeService.getNodes(spaceSlug);

    // descendants of conversation
    const messageNodes = allNodes.filter(
      (node: any) =>
        node.nodeDetails?.type === 'message' &&
        node.attributes?.some(
          (attr: any) => attr.type === 'CONTAINS' && attr.sourceNodeId === conversationId
        )
    );

    // chronological order
    const sorted = messageNodes.sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    console.log('ALL NODES', allNodes);
    return sorted.map(toAppendMessage);
  };


const loadConversations = async (spaceSlug: string) => {
  const nodes = await nodeService.getNodes(spaceSlug);

  const conversations = nodes
    .filter((node: any) =>
      node.nodeDetails?.type === 'conversation'
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  return conversations;
};



  useEffect(() => {
    const stored = localStorage.getItem('conversationId');

    if (stored) {
      setConversationNodeId(stored);
    }
  }, []);

  useEffect(() => {
    if (!conversationNodeId) return;

    const init = async () => {
      try {
        const history = await loadConversationHistory(conversationNodeId);

        setMessages(history);
        messagesRef.current = history;
      } catch (error) {
        console.error('Failed to load history', error);
      }
    };

    init();
  }, [conversationNodeId]);

const createConversationNode = async (spaceSlug: string) => {
  const now = new Date();
  const title = `Chat - ${now.toISOString().slice(0, 16).replace('T', ' ')}`;

  const node = await nodeService.createNode(spaceSlug, {
    title,
    nodeType: NodeType.REGULAR,
    content: title,
    nodeDetails: {
      type: 'conversation',
    },
  });

  return node.id;
};

const handleNewMessage = useCallback(
  async (message: AppendMessage) => {
    if (isRunning) return;

    const spaceSlug = 'test-parent-node'; 
    const text = extractText(message.content);

    setIsRunning(true);

    setMessages((prev) => {
      const updated = [...prev];
      updated.push(message);
      messagesRef.current = updated;
      return updated;
    });

    try {
      // 1. ENSURE CONVERSATION EXISTS
      let convoId = conversationNodeId;

      if (!convoId && !creatingConversationRef.current) {
        creatingConversationRef.current = true;

        try {
          convoId = await createConversationNode(spaceSlug);
          setConversationNodeId(convoId);

          // ⚠️ temporary persistence (remove later if not needed)
          localStorage.setItem('conversationId', convoId);
        } finally {
          creatingConversationRef.current = false;
        }
      }

      if (!convoId) {
        throw new Error('Conversation node not created');
      }

      // 2. CREATE USER MESSAGE NODE
      const userNode = await nodeService.createNode(spaceSlug, {
        title: 'user-message',
        content: text,
        nodeType: NodeType.REGULAR,
        nodeDetails: {
          type: 'message',
          role: 'user',
          content: text,
        },
      });

      // 3. LINK USER MESSAGE → CONVERSATION
      await linkMessageToConversation(convoId, userNode.id);

      // 4. CALL LLM
      const response = await sendChatMessage(
        mapToBackendMessages(messagesRef.current)
      );

      const assistantMessage = createAssistantMessage(response.reply);

      setMessages((prev) => {
        const updated = [...prev];
        updated.push(assistantMessage);
        messagesRef.current = updated;
        return updated;
      });

      // 5. CREATE ASSISTANT NODE
      const agentNode = await nodeService.createNode(spaceSlug, {
        title: 'agent-message',
        content: response.reply,
        nodeType: NodeType.REGULAR,
        nodeDetails: {
          type: 'message',
          role: 'assistant',
          content: response.reply,
        },
      });

      // 6. LINK ASSISTANT → CONVERSATION
      await linkMessageToConversation(convoId, agentNode.id);
    } catch (error) {
      console.error('handleNewMessage error:', error);
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
