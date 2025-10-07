// src/hooks/api/useWorkspaces.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '@/services/api';
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteCollaboratorRequest,
} from '@/types/backend-dtos';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces(),
  });
}

export function useWorkspace(slug: string) {
  return useQuery({
    queryKey: ['workspaces', slug],
    queryFn: () => workspaceService.getWorkspaceBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspaceService.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspace(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => workspaceService.updateWorkspace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

/**
 * Get collaborators for a workspace
 */
export function useCollaborators(workspaceId: number) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'collaborators'],
    queryFn: () => workspaceService.getCollaborators(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Invite a collaborator to a workspace
 */
export function useInviteCollaborator(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteCollaboratorRequest) =>
      workspaceService.inviteCollaborator(workspaceId, data),
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
 */
export function useRemoveCollaborator(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      workspaceService.removeCollaborator(workspaceId, userId),
    onSuccess: () => {
      // Invalidate collaborators list
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'collaborators'],
      });
    },
  });
}
