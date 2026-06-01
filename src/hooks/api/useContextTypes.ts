import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contextTypeService } from '@/services/api';
import type { ContextTypeCreateRequest, ContextTypeUpdateRequest } from '@/types/backend-dtos';

export const contextTypeKeys = {
  all: (spaceId: string) => ['context-types', spaceId] as const,
  detail: (spaceId: string, slug: string) => ['context-types', spaceId, slug] as const,
};

export function useContextTypes(spaceId: string) {
  return useQuery({
    queryKey: contextTypeKeys.all(spaceId),
    queryFn: () => contextTypeService.listContextTypes(spaceId),
    enabled: !!spaceId,
  });
}

export function useContextType(spaceId: string, slug: string) {
  return useQuery({
    queryKey: contextTypeKeys.detail(spaceId, slug),
    queryFn: () => contextTypeService.getContextType(spaceId, slug),
    enabled: !!spaceId && !!slug,
  });
}

export function useCreateContextType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, data, spaceMode }: { spaceId: string; data: ContextTypeCreateRequest; spaceMode?: 'CONFIGURATION' | 'PRODUCTION' }) =>
      contextTypeService.createContextType(spaceId, data, spaceMode),
    onSuccess: (_, { spaceId }) => queryClient.invalidateQueries({ queryKey: contextTypeKeys.all(spaceId) }),
  });
}

export function useUpdateContextType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, slug, data, spaceMode }: { spaceId: string; slug: string; data: ContextTypeUpdateRequest; spaceMode?: 'CONFIGURATION' | 'PRODUCTION' }) =>
      contextTypeService.updateContextType(spaceId, slug, data, spaceMode),
    onSuccess: (_, { spaceId }) => queryClient.invalidateQueries({ queryKey: contextTypeKeys.all(spaceId) }),
  });
}

export function useDeleteContextType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, slug, spaceMode }: { spaceId: string; slug: string; spaceMode?: 'CONFIGURATION' | 'PRODUCTION' }) =>
      contextTypeService.deleteContextType(spaceId, slug, spaceMode),
    onSuccess: (_, { spaceId }) => queryClient.invalidateQueries({ queryKey: contextTypeKeys.all(spaceId) }),
  });
}
