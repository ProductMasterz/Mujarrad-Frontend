// src/services/api/api-key.service.ts

import apiClient, { extractPage } from './client';
import type {
  ApiKeyResponse,
  ApiKeyListResponse,
  ApiKeyCreateRequest,
  ApiKeyRotateRequest,
} from '@/types/backend-dtos';

export const apiKeyService = {
  async listKeys(activeOnly = false): Promise<ApiKeyListResponse[]> {
    const response = await apiClient.get<any>('/api-keys', {
      params: { activeOnly },
    });
    return extractPage<ApiKeyListResponse>(response.data);
  },

  async getKey(keyId: string): Promise<ApiKeyListResponse> {
    const response = await apiClient.get<ApiKeyListResponse>(`/api-keys/${keyId}`);
    return response.data;
  },

  async createKey(data: ApiKeyCreateRequest): Promise<ApiKeyResponse> {
    const response = await apiClient.post<ApiKeyResponse>('/api-keys', data);
    return response.data;
  },

  async rotateKey(keyId: string, data: ApiKeyRotateRequest): Promise<ApiKeyResponse> {
    const response = await apiClient.post<ApiKeyResponse>(`/api-keys/${keyId}/rotate`, data);
    return response.data;
  },

  async revokeKey(keyId: string): Promise<void> {
    await apiClient.delete(`/api-keys/${keyId}`);
  },
};
