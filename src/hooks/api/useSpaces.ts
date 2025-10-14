// src/hooks/api/useSpaces.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spaceService } from '@/services/api/space.service';
import type {
  CreateSpaceRequest,
  UpdateSpaceRequest,
} from '@/types/backend-dtos';

/**
 * Space Query Keys
 * Centralized query key factory for space-related queries
 */
export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...spaceKeys.lists(), filters] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (slug: string) => [...spaceKeys.details(), slug] as const,
};

/**
 * Hook to fetch all spaces for the current user
 * @returns Query result with array of Space objects
 */
export function useSpaces() {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: () => spaceService.getSpaces(),
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch a single space by slug
 * @param slug - Space slug (URL-friendly identifier)
 * @returns Query result with Space object
 */
export function useSpace(slug: string) {
  return useQuery({
    queryKey: spaceKeys.detail(slug),
    queryFn: () => spaceService.getSpaceBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to fetch a single space by ID
 * @param id - Space UUID
 * @returns Query result with Space object
 */
export function useSpaceById(id: string) {
  return useQuery({
    queryKey: [...spaceKeys.details(), 'id', id],
    queryFn: () => spaceService.getSpace(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to create a new space
 * Automatically invalidates the spaces list query on success
 * @returns Mutation functions for creating a space
 */
export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpaceRequest) => spaceService.createSpace(data),
    onSuccess: () => {
      // Invalidate and refetch spaces list
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
    },
  });
}

/**
 * Hook to update an existing space
 * Automatically invalidates related queries on success
 * @param id - Space UUID
 * @returns Mutation functions for updating a space
 */
export function useUpdateSpace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSpaceRequest) => spaceService.updateSpace(id, data),
    onSuccess: () => {
      // Invalidate all space queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
    },
  });
}

/**
 * Hook to delete a space
 * Automatically invalidates the spaces list query on success
 * @returns Mutation functions for deleting a space
 */
export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spaceService.deleteSpace(id),
    onSuccess: () => {
      // Invalidate and refetch spaces list
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
    },
  });
}
