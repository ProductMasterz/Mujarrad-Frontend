// src/hooks/api/useSpaces.ts
// @deprecated - Use useSpaces from './useSpaces' instead

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spaceService } from '@/services/api';
import type {
  CreateSpaceRequest,
  UpdateSpaceRequest,
  InviteCollaboratorRequest,
  SpaceCollaborator,
} from '@/types/backend-dtos';

/**
 * Query key factory for spaces
 */
export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: () => [...spaceKeys.lists()] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (slug: string) => [...spaceKeys.details(), slug] as const,
};

/** @deprecated Use useSpaces instead */
export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: () => spaceService.getSpaces(),
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/** @deprecated Use useSpace instead */
export function useSpace(slug: string) {
  return useQuery({
    queryKey: ['spaces', slug],
    queryFn: () => spaceService.getSpaceBySlug(slug),
    enabled: !!slug,
  });
}

/** @deprecated Use useCreateSpace instead */
export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpaceRequest) => spaceService.createSpace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/** @deprecated Use useUpdateSpace instead */
export function useUpdateSpace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSpaceRequest) => spaceService.updateSpace(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/** @deprecated Use useDeleteSpace instead */
export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spaceService.deleteSpace(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

/**
 * Get collaborators for a space
 * @deprecated - Collaborator functionality needs to be migrated to space-based API
 */
export function useCollaborators(spaceId: string) {
  return useQuery<SpaceCollaborator[]>({
    queryKey: ['spaces', spaceId, 'collaborators'],
    queryFn: async () => {
      // TODO: Update when backend migrates collaborators to space-based endpoints
      throw new Error('Collaborators API not yet migrated to spaces endpoint');
    },
    enabled: !!spaceId,
  });
}

/**
 * Invite a collaborator to a space
 * @deprecated - Collaborator functionality needs to be migrated to space-based API
 */
export function useInviteCollaborator(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteCollaboratorRequest) => {
      // TODO: Update when backend migrates collaborators to space-based endpoints
      throw new Error('Collaborators API not yet migrated to spaces endpoint');
    },
    onSuccess: () => {
      // Invalidate collaborators list
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceId, 'collaborators'],
      });
    },
  });
}

/**
 * Remove a collaborator from a space
 * @deprecated - Collaborator functionality needs to be migrated to space-based API
 */
export function useRemoveCollaborator(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // TODO: Update when backend migrates collaborators to space-based endpoints
      throw new Error('Collaborators API not yet migrated to spaces endpoint');
    },
    onSuccess: () => {
      // Invalidate collaborators list
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceId, 'collaborators'],
      });
    },
  });
}
