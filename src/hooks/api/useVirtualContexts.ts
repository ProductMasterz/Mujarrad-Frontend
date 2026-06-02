import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { virtualContextService } from '@/services/api';
import type {
  VirtualContextAddMemberRequest,
  CrossSpaceAttributeCreateRequest,
} from '@/types/backend-dtos';

export const vcKeys = {
  all: ['virtual-contexts'] as const,
  detail: (id: string) => ['virtual-contexts', id] as const,
  bySpace: (spaceId: string) => ['virtual-contexts', 'space', spaceId] as const,
  members: (id: string) => ['virtual-contexts', id, 'members'] as const,
  attributes: (id: string) => ['virtual-contexts', id, 'attributes'] as const,
  nodeAttributes: (nodeId: string) =>
    ['virtual-contexts', 'node-cross-space-attributes', nodeId] as const,
};

export function useVirtualContexts() {
  return useQuery({
    queryKey: vcKeys.all,
    queryFn: () => virtualContextService.listVirtualContexts(),
  });
}

export function useVirtualContextsForSpace(spaceId: string) {
  return useQuery({
    queryKey: vcKeys.bySpace(spaceId),
    queryFn: () => virtualContextService.listVirtualContextsForSpace(spaceId),
    enabled: !!spaceId,
  });
}

export function useVCMembers(vcId: string) {
  return useQuery({
    queryKey: vcKeys.members(vcId),
    queryFn: () => virtualContextService.listMembers(vcId),
    enabled: !!vcId,
  });
}

export function useCrossSpaceAttributes(vcId: string) {
  return useQuery({
    queryKey: vcKeys.attributes(vcId),
    queryFn: () => virtualContextService.listCrossSpaceAttributes(vcId),
    enabled: !!vcId,
  });
}

export function useNodeCrossSpaceAttributes(nodeId: string) {
  return useQuery({
    queryKey: vcKeys.nodeAttributes(nodeId),
    queryFn: () => virtualContextService.getNodeCrossSpaceAttributes(nodeId),
    enabled: !!nodeId,
  });
}

export function useCreateVirtualContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      ownerSpaceId: string;
      description?: string;
      visibility?: string;
      members?: VirtualContextAddMemberRequest[];
    }) => virtualContextService.createVirtualContextWithMembers(data),

    onSuccess: (createdVC) => {
      queryClient.invalidateQueries({ queryKey: vcKeys.all });

      if (createdVC.ownerSpaceId) {
        queryClient.invalidateQueries({
          queryKey: vcKeys.bySpace(createdVC.ownerSpaceId),
        });
      }
    },
  });
}

export function useAddVCMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vcId,
      spaceId,
      role,
    }: {
      vcId: string;
      spaceId: string;
      role?: 'OWNER' | 'CONTRIBUTOR' | 'READONLY';
    }) => virtualContextService.addMember(vcId, { spaceId, role }),

    onSuccess: (_, { vcId, spaceId }) => {
      queryClient.invalidateQueries({ queryKey: vcKeys.members(vcId) });
      queryClient.invalidateQueries({ queryKey: vcKeys.all });
      queryClient.invalidateQueries({ queryKey: vcKeys.bySpace(spaceId) });
    },
  });
}

export function useCreateCrossSpaceAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vcId,
      data,
    }: {
      vcId: string;
      data: CrossSpaceAttributeCreateRequest;
    }) => virtualContextService.createCrossSpaceAttribute(vcId, data),

    onSuccess: (_, { vcId, data }) => {
      queryClient.invalidateQueries({ queryKey: vcKeys.attributes(vcId) });

      if (data.sourceNodeId) {
        queryClient.invalidateQueries({
          queryKey: vcKeys.nodeAttributes(data.sourceNodeId),
        });
      }

      if (data.targetNodeId) {
        queryClient.invalidateQueries({
          queryKey: vcKeys.nodeAttributes(data.targetNodeId),
        });
      }
    },
  });
}

export function useDeleteVirtualContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vcId: string) => virtualContextService.deleteVirtualContext(vcId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcKeys.all });
      queryClient.invalidateQueries({ queryKey: ['virtual-contexts'] });
    },
  });
}