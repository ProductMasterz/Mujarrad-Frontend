import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voidService } from '@/services/api';
import { nodeKeys } from './useNodes';
import type { VoidNodeCreateRequest, VoidNodeUpdateRequest } from '@/types/backend-dtos';

export const voidKeys = {
  all: ['void-nodes'] as const,
  detail: (id: string) => ['void-nodes', id] as const,
};

export function useVoidNodes() {
  return useQuery({
    queryKey: voidKeys.all,
    queryFn: () => voidService.listVoidNodes(),
  });
}

export function useVoidNode(nodeId: string) {
  return useQuery({
    queryKey: voidKeys.detail(nodeId),
    queryFn: () => voidService.getVoidNode(nodeId),
    enabled: !!nodeId,
  });
}

export function useCreateVoidNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VoidNodeCreateRequest) =>
      voidService.createVoidNode(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voidKeys.all }),
  });
}

export function useUpdateVoidNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: VoidNodeUpdateRequest }) =>
      voidService.updateVoidNode(nodeId, data),
    onSuccess: (_, { nodeId }) => {
      queryClient.invalidateQueries({ queryKey: voidKeys.all });
      queryClient.invalidateQueries({ queryKey: voidKeys.detail(nodeId) });
    },
  });
}

export function useDeleteVoidNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => voidService.deleteVoidNode(nodeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voidKeys.all }),
  });
}

export function useAssignVoidToSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, spaceId, contextId }: { nodeId: string; spaceId: string; contextId?: string }) =>
      voidService.assignToSpace(nodeId, { spaceId, contextId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voidKeys.all });
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
  });
}
