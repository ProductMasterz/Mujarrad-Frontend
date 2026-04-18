import { useEffect, useState } from 'react';
import { nodeService } from '@/services/api/node.service';
import { Node, NodeType } from '@/types/backend-dtos';

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
          .filter((node) => node.nodeType === NodeType.REGULAR)
          .filter((node) => node.nodeDetails?.type === 'conversation') 
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        setConversations(conversationNodes);
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