import { apiClient } from './client';
import type {
  Node,
  Attribute,
  BulkNodeCreateItem,
  BulkNodeUpdateItem,
  BulkAttributeCreateItem,
  BulkContextTypeCreateItem,
  BulkResponse,
  BulkImportRequest,
  BulkImportResponse,
  BulkOptions,
} from '@/types/backend-dtos';

function bulkUrl(spaceSlug: string, path: string) {
  return `/spaces/${spaceSlug}/bulk${path}`;
}

export const bulkService = {
  // --- Nodes ---

  async createNodes(
    spaceSlug: string,
    items: BulkNodeCreateItem[],
    options?: BulkOptions,
  ): Promise<BulkResponse<Node>> {
    const { data } = await apiClient.post<BulkResponse<Node>>(
      bulkUrl(spaceSlug, '/nodes'),
      { items, options },
    );
    return data;
  },

  async fetchNodes(spaceSlug: string, ids: string[]): Promise<BulkResponse<Node>> {
    const { data } = await apiClient.post<BulkResponse<Node>>(
      bulkUrl(spaceSlug, '/nodes/fetch'),
      { ids },
    );
    return data;
  },

  async updateNodes(
    spaceSlug: string,
    items: BulkNodeUpdateItem[],
    options?: BulkOptions,
  ): Promise<BulkResponse<Node>> {
    const { data } = await apiClient.put<BulkResponse<Node>>(
      bulkUrl(spaceSlug, '/nodes/update'),
      { items, options },
    );
    return data;
  },

  async deleteNodes(spaceSlug: string, ids: string[]): Promise<BulkResponse> {
    const { data } = await apiClient.post<BulkResponse>(
      bulkUrl(spaceSlug, '/nodes/delete'),
      { ids },
    );
    return data;
  },

  // --- Attributes ---

  async createAttributes(
    spaceSlug: string,
    items: BulkAttributeCreateItem[],
    options?: BulkOptions,
  ): Promise<BulkResponse<Attribute>> {
    const { data } = await apiClient.post<BulkResponse<Attribute>>(
      bulkUrl(spaceSlug, '/attributes'),
      { items, options },
    );
    return data;
  },

  async fetchAttributes(spaceSlug: string, ids: string[]): Promise<BulkResponse<Attribute>> {
    const { data } = await apiClient.post<BulkResponse<Attribute>>(
      bulkUrl(spaceSlug, '/attributes/fetch'),
      { ids },
    );
    return data;
  },

  async updateAttributes(
    spaceSlug: string,
    items: Array<{ id: string; attributeValue?: Record<string, unknown>; properties?: Record<string, unknown> }>,
    options?: BulkOptions,
  ): Promise<BulkResponse<Attribute>> {
    const { data } = await apiClient.put<BulkResponse<Attribute>>(
      bulkUrl(spaceSlug, '/attributes/update'),
      { items, options },
    );
    return data;
  },

  async deleteAttributes(spaceSlug: string, ids: string[]): Promise<BulkResponse> {
    const { data } = await apiClient.post<BulkResponse>(
      bulkUrl(spaceSlug, '/attributes/delete'),
      { ids },
    );
    return data;
  },

  // --- Context Types ---

  async createContextTypes(
    spaceSlug: string,
    items: BulkContextTypeCreateItem[],
    options?: BulkOptions,
  ): Promise<BulkResponse> {
    const { data } = await apiClient.post<BulkResponse>(
      bulkUrl(spaceSlug, '/context-types'),
      { items, options },
    );
    return data;
  },

  async updateContextTypes(
    spaceSlug: string,
    items: Array<{ id: string; name?: string; slug?: string; attributeSchema?: Record<string, unknown> }>,
  ): Promise<BulkResponse> {
    const { data } = await apiClient.put<BulkResponse>(
      bulkUrl(spaceSlug, '/context-types/update'),
      { items },
    );
    return data;
  },

  async deleteContextTypes(spaceSlug: string, ids: string[]): Promise<BulkResponse> {
    const { data } = await apiClient.post<BulkResponse>(
      bulkUrl(spaceSlug, '/context-types/delete'),
      { ids },
    );
    return data;
  },

  // --- Composite Import ---

  async import(
    spaceSlug: string,
    request: BulkImportRequest,
  ): Promise<BulkImportResponse> {
    const { data } = await apiClient.post<BulkImportResponse>(
      bulkUrl(spaceSlug, '/import'),
      request,
    );
    return data;
  },

  async importDryRun(
    spaceSlug: string,
    request: BulkImportRequest,
  ): Promise<BulkImportResponse> {
    const { data } = await apiClient.post<BulkImportResponse>(
      bulkUrl(spaceSlug, '/import'),
      { ...request, options: { dryRun: true } },
    );
    return data;
  },
};
