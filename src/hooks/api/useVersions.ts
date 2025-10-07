// src/hooks/api/useVersions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionService } from '@/services/api';

export function useNodeVersions(workspaceSlug: string, nodeId: number) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'versions'],
    queryFn: () => versionService.getNodeVersions(workspaceSlug, nodeId),
    enabled: !!workspaceSlug && !!nodeId,
  });
}

export function useVersion(workspaceSlug: string, nodeId: number, versionId: number) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'versions', versionId],
    queryFn: () => versionService.getVersion(workspaceSlug, nodeId, versionId),
    enabled: !!workspaceSlug && !!nodeId && !!versionId,
  });
}

export function useRestoreVersion(workspaceSlug: string, nodeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: number) =>
      versionService.restoreVersion(workspaceSlug, nodeId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId]
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'versions']
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'graph']
      });
    },
  });
}
