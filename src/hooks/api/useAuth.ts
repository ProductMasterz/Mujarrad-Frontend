// src/hooks/api/useAuth.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api';
import { useAuthStore } from '@/stores';
import type { LoginRequest, CreateUserRequest } from '@/types/backend-dtos';

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
    onSuccess: (user) => {
      setUser(user);
    },
    onError: () => {
      setUser(null);
    },
  });
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setUser(response.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: CreateUserRequest) => authService.register(data),
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}
