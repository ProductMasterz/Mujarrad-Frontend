import apiClient from './client';
import type {
  ContextType,
  ContextTypeCreateRequest,
  ContextTypeUpdateRequest,
} from '@/types/backend-dtos';

export const contextTypeService = {
  async listContextTypes(spaceId: string): Promise<ContextType[]> {
    const response = await apiClient.get<ContextType[]>(
      `/spaces/${spaceId}/context-types`
    );
    return response.data;
  },

  async getContextType(spaceId: string, slug: string): Promise<ContextType> {
    const response = await apiClient.get<ContextType>(
      `/spaces/${spaceId}/context-types/${slug}`
    );
    return response.data;
  },

  async createContextType(
    spaceId: string,
    data: ContextTypeCreateRequest,
    spaceMode?: 'CONFIGURATION' | 'PRODUCTION'
  ): Promise<ContextType> {
    const headers: Record<string, string> = {};
    if (spaceMode) headers['X-Space-Mode'] = spaceMode;
    const response = await apiClient.post<ContextType>(
      `/spaces/${spaceId}/context-types`,
      data,
      { headers }
    );
    return response.data;
  },

  async updateContextType(
    spaceId: string,
    slug: string,
    data: ContextTypeUpdateRequest,
    spaceMode?: 'CONFIGURATION' | 'PRODUCTION'
  ): Promise<ContextType> {
    const headers: Record<string, string> = {};
    if (spaceMode) headers['X-Space-Mode'] = spaceMode;
    const response = await apiClient.put<ContextType>(
      `/spaces/${spaceId}/context-types/${slug}`,
      data,
      { headers }
    );
    return response.data;
  },

  async deleteContextType(
    spaceId: string,
    slug: string,
    spaceMode?: 'CONFIGURATION' | 'PRODUCTION'
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (spaceMode) headers['X-Space-Mode'] = spaceMode;
    await apiClient.delete(`/spaces/${spaceId}/context-types/${slug}`, { headers });
  },
};
