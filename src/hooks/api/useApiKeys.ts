// src/hooks/api/useApiKeys.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyService } from '@/services/api/api-key.service';
import type {
  ApiKeyCreateRequest,
  ApiKeyRotateRequest,
  ApiKeyListResponse,
} from '@/types/backend-dtos';

export const apiKeyKeys = {
  all: ['api-keys'] as const,
  lists: () => [...apiKeyKeys.all, 'list'] as const,
  list: (activeOnly?: boolean) => [...apiKeyKeys.lists(), { activeOnly }] as const,
  details: () => [...apiKeyKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeyKeys.details(), id] as const,
};

export function useApiKeys(activeOnly = false) {
  return useQuery({
    queryKey: apiKeyKeys.list(activeOnly),
    queryFn: () => apiKeyService.listKeys(activeOnly),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApiKeyCreateRequest) => apiKeyService.createKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}

export function useRotateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: string; data: ApiKeyRotateRequest }) =>
      apiKeyService.rotateKey(keyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => apiKeyService.revokeKey(keyId),
    onMutate: async (keyId) => {
      await queryClient.cancelQueries({ queryKey: apiKeyKeys.lists() });

      const previousKeys = queryClient.getQueriesData<ApiKeyListResponse[]>({
        queryKey: apiKeyKeys.lists(),
      });

      queryClient.setQueriesData<ApiKeyListResponse[]>(
        { queryKey: apiKeyKeys.lists() },
        (old) => old?.filter((key) => key.id !== keyId)
      );

      return { previousKeys };
    },
    onError: (_err, _keyId, context) => {
      if (context?.previousKeys) {
        context.previousKeys.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.lists() });
    },
  });
}
