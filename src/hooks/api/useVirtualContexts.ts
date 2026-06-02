import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { virtualContextService } from '@/services/api';

export const vcKeys = {
  all: ['virtual-contexts'] as const,
  detail: (id: string) => ['virtual-contexts', id] as const,
  members: (id: string) => ['virtual-contexts', id, 'members'] as const,
  attributes: (id: string) => ['virtual-contexts', id, 'attributes'] as const,
};

export function useVirtualContexts() {
  return useQuery({
    queryKey: vcKeys.all,
    queryFn: () => virtualContextService.listVirtualContexts(),
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

export function useCreateVirtualContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; ownerSpaceId: string; description?: string }) =>
      virtualContextService.createVirtualContext(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vcKeys.all }),
  });
}

export function useAddVCMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vcId, spaceId, role }: { vcId: string; spaceId: string; role?: 'OWNER' | 'CONTRIBUTOR' | 'READONLY' }) =>
      virtualContextService.addMember(vcId, { spaceId, role }),
    onSuccess: (_, { vcId }) => queryClient.invalidateQueries({ queryKey: vcKeys.members(vcId) }),
  });
}

export function useDeleteVirtualContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vcId: string) => virtualContextService.deleteVirtualContext(vcId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vcKeys.all }),
  });
}
