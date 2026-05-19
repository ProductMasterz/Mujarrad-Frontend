// src/hooks/api/useVersions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionService } from '@/services/api';

export function useNodeVersions(spaceSlug: string, nodeId: number) {
  return useQuery({
    queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'versions'],
    queryFn: () => versionService.getNodeVersions(spaceSlug, nodeId),
    enabled: !!spaceSlug && !!nodeId,
  });
}

export function useVersion(spaceSlug: string, nodeId: number, versionId: number) {
  return useQuery({
    queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'versions', versionId],
    queryFn: () => versionService.getVersion(spaceSlug, nodeId, versionId),
    enabled: !!spaceSlug && !!nodeId && !!versionId,
  });
}

export function useRestoreVersion(spaceSlug: string, nodeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: number) =>
      versionService.restoreVersion(spaceSlug, nodeId, versionId),
    onSuccess: () => {
      // Invalidate node data and versions list after restoration
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'nodes', nodeId]
      });
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'versions']
      });
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'graph']
      });
    },
  });
}

export function useDeleteVersion(spaceSlug: string, nodeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: number) =>
      versionService.deleteVersion(spaceSlug, nodeId, versionId),
    onSuccess: () => {
      // Invalidate versions list after deletion
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'versions']
      });
    },
  });
}
