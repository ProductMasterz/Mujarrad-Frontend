import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lockingService } from '@/services/api';
import { nodeKeys } from './useNodes';
import { spaceKeys } from './useSpaces';
import type { LockLevel } from '@/types/backend-dtos';

export function useLockNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, nodeId, lockLevel }: { spaceSlug: string; nodeId: string; lockLevel: LockLevel }) =>
      lockingService.lockNode(spaceSlug, nodeId, { lockLevel }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nodeKeys.all }),
  });
}

export function useUnlockNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, nodeId }: { spaceSlug: string; nodeId: string }) =>
      lockingService.unlockNode(spaceSlug, nodeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nodeKeys.all }),
  });
}

export function useLockSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug }: { spaceSlug: string }) =>
      lockingService.lockSpace(spaceSlug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: spaceKeys.all }),
  });
}

export function useUnlockSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug }: { spaceSlug: string }) =>
      lockingService.unlockSpace(spaceSlug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: spaceKeys.all }),
  });
}

export function useLockAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, attributeId }: { spaceSlug: string; attributeId: string }) =>
      lockingService.lockAttribute(spaceSlug, attributeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nodeKeys.all }),
  });
}

export function useUnlockAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceSlug, attributeId }: { spaceSlug: string; attributeId: string }) =>
      lockingService.unlockAttribute(spaceSlug, attributeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nodeKeys.all }),
  });
}
