import { useEffect, useState } from 'react';
import { nodeService } from '@/services/api/node.service';
import { Node, NodeType ,AttributeKey} from '@/types/backend-dtos';

import { attributeService } from '@/services/api';


export function useConversations() {
  const [conversations, setConversations] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  //Testing
/*/// 1. mock test
useEffect(() => {
  setLoading(true);

  setTimeout(() => {
    setConversations([
      {
        id: '1',
        title: 'First Conversation',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Older Conversation',
        createdAt: new Date(Date.now() - 10000000).toISOString(),
      },
    ] as any);

    setLoading(false);
  }, 500);
}, []);
*/
  //end
  //API
  useEffect(() => {
  const fetchConversations = async () => {
    setLoading(true);

    try {
      const nodes = await nodeService.getNodes('default-space');

      const conversationNodes = nodes
        .filter((node) => node.nodeDetails?.role === 'conversation')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      // Attach message text for search
      const enriched = await Promise.all(
        conversationNodes.map(async (conv) => {
          try {
            const attrs = await attributeService.getNodeAttributes(
              conv.id,
              { attributeType: AttributeKey.CONTAINS }
            );

            const messageIds = attrs.map((a) => a.targetNodeId);

            const messageNodes = await Promise.all(
              messageIds.map((id) =>
                nodeService.getNode('default-space', id)
              )
            );

            const allText = messageNodes
              .map((m) => m.content || '')
              .join(' ')
              .toLowerCase();

            return {
              ...conv,
              searchableText: allText,
            };
          } catch {
            return { ...conv, searchableText: '' };
          }
        })
      );

      setConversations(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchConversations();
}, []);
  return { conversations, loading };
}