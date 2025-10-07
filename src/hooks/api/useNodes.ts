// src/hooks/api/useNodes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api';
import type { CreateNodeRequest, UpdateNodeRequest } from '@/types/backend-dtos';

export function useNodes(workspaceSlug: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes'],
    queryFn: () => nodeService.getNodes(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}

export function useNode(workspaceSlug: string, nodeId: number) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId],
    queryFn: () => nodeService.getNode(workspaceSlug, nodeId),
    enabled: !!workspaceSlug && !!nodeId,
  });
}

export function useCreateNode(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNodeRequest) => nodeService.createNode(workspaceSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'graph'] });
    },
  });
}

export function useUpdateNode(workspaceSlug: string, nodeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNodeRequest) => nodeService.updateNode(workspaceSlug, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'graph'] });
    },
  });
}

export function useDeleteNode(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: number) => nodeService.deleteNode(workspaceSlug, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'graph'] });
    },
  });
}

export function useSearchNodes(workspaceSlug: string, query: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes', 'search', query],
    queryFn: () => nodeService.searchNodes(workspaceSlug, { query }),
    enabled: !!workspaceSlug && query.length > 0,
  });
}
