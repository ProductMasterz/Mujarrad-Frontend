import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api';
import { nodeKeys } from './useNodes';
import type { MigrateNodeRequest } from '@/types/backend-dtos';

export function useMigrateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, nodeId, data }: { spaceSlug: string; nodeId: string; data: MigrateNodeRequest }) =>
      nodeService.migrateNode(spaceSlug, nodeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nodeKeys.all }),
  });
}
