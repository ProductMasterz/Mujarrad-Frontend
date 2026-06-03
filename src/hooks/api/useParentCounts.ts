import { useQueries } from '@tanstack/react-query';
import { attributeService } from '@/services/api/attribute.service';

export function useParentCounts(nodeIds: string[]) {
  const queries = useQueries({
    queries: nodeIds.map((nodeId) => ({
      queryKey: ['incomingAttributes', nodeId, { attributeType: 'contains' }],
      queryFn: () => attributeService.getIncomingAttributes(nodeId, { attributeType: 'contains' }),
      staleTime: 3 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!nodeId,
    })),
  });

  const counts = new Map<string, number>();
  queries.forEach((query, i) => {
    if (query.data) {
      counts.set(nodeIds[i], query.data.length);
    }
  });

  return counts;
}
