// src/hooks/api/useWorkspaces.ts
// @deprecated - Use useSpaces from './useSpaces' instead

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spaceService } from '@/services/api';
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteCollaboratorRequest,
} from '@/types/backend-dtos';

/** @deprecated Use useSpaces instead */
export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => spaceService.getSpaces(),
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/** @deprecated Use useSpace instead */
export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: ['workspaces', slug],
    queryFn: () => spaceService.getSpaceBySlug(slug),
    enabled: !!slug,
  });
}

/** @deprecated Use useCreateSpace instead */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => spaceService.createSpace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/** @deprecated Use useUpdateSpace instead */
export function useUpdateWorkspace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => spaceService.updateSpace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/** @deprecated Use useDeleteSpace instead */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spaceService.deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/**
 * Get collaborators for a workspace
 * @deprecated - Collaborator functionality needs to be migrated to space-based API
 */
export function useCollaborators(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'collaborators'],
    queryFn: async () => {
      // TODO: Update when backend migrates collaborators to space-based endpoints
      throw new Error('Collaborators API not yet migrated to spaces endpoint');
    },
    enabled: !!workspaceId,
  });
}

/**
 * Invite a collaborator to a workspace
 * @deprecated - Collaborator functionality needs to be migrated to space-based API
 */
export function useInviteCollaborator(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteCollaboratorRequest) => {
      // TODO: Update when backend migrates collaborators to space-based endpoints
      throw new Error('Collaborators API not yet migrated to spaces endpoint');
    },
    onSuccess: () => {
      // Invalidate collaborators list
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'collaborators'],
      });
    },
  });
}

/**
 * Remove a collaborator from a workspace
 * @deprecated - Collaborator functionality needs to be migrated to space-based API
 */
export function useRemoveCollaborator(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // TODO: Update when backend migrates collaborators to space-based endpoints
      throw new Error('Collaborators API not yet migrated to spaces endpoint');
    },
    onSuccess: () => {
      // Invalidate collaborators list
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'collaborators'],
      });
    },
  });
}
