import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/api';

export const orgKeys = {
  all: ['organizations'] as const,
  members: (orgId: string) => ['organizations', orgId, 'members'] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.all,
    queryFn: () => organizationService.listOrganizations(),
  });
}

export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: orgKeys.members(orgId),
    queryFn: () => organizationService.listMembers(orgId),
    enabled: !!orgId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => organizationService.createOrganization(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orgKeys.all }),
  });
}

export function useAddOrgMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, userId, role }: { orgId: string; userId: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER' }) =>
      organizationService.addMember(orgId, { userId, role }),
    onSuccess: (_, { orgId }) => queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) }),
  });
}

export function useRemoveOrgMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) =>
      organizationService.removeMember(orgId, userId),
    onSuccess: (_, { orgId }) => queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) }),
  });
}
