/**
 * Configuration Schemas - Element type mappings
 * Generated with assistance from ollama:llama3.1:8b
 */

import { ElementTypeConfig, ExcalidrawElementType } from '@/types/whiteboard';

export const DEFAULT_ELEMENT_CONFIGS: ElementTypeConfig[] = [
  {
    excalidraw_type: 'rectangle',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'shape_rectangle',
    title_source: 'auto',
    title_prefix: 'Rectangle',
    supports_content: false,
    supports_connections: true,
    is_connector: false,
  },
  {
    excalidraw_type: 'ellipse',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'shape_ellipse',
    title_source: 'auto',
    title_prefix: 'Ellipse',
    supports_content: false,
    supports_connections: true,
    is_connector: false,
  },
  {
    excalidraw_type: 'diamond',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'shape_diamond',
    title_source: 'auto',
    title_prefix: 'Diamond',
    supports_content: false,
    supports_connections: true,
    is_connector: false,
  },
  {
    excalidraw_type: 'text',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'text',
    title_source: 'text',
    title_prefix: 'Text',
    supports_content: true,
    supports_connections: true,
    is_connector: false,
  },
  {
    excalidraw_type: 'freedraw',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'drawing',
    title_source: 'auto',
    title_prefix: 'Drawing',
    supports_content: false,
    supports_connections: false,
    is_connector: false,
  },
  {
    excalidraw_type: 'image',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'image',
    title_source: 'auto',
    title_prefix: 'Image',
    supports_content: false,
    supports_connections: true,
    is_connector: false,
  },
  {
    excalidraw_type: 'arrow',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'shape_rectangle', // Fallback if standalone
    title_source: 'auto',
    title_prefix: 'Arrow',
    supports_content: false,
    supports_connections: false,
    is_connector: true,
  },
  {
    excalidraw_type: 'line',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'shape_rectangle', // Fallback if standalone
    title_source: 'auto',
    title_prefix: 'Line',
    supports_content: false,
    supports_connections: false,
    is_connector: true,
  },
  {
    excalidraw_type: 'frame',
    mujarrad_node_type: 'REGULAR',
    element_subtype: 'frame',
    title_source: 'auto',
    title_prefix: 'Frame',
    supports_content: false,
    supports_connections: false,
    is_connector: false,
  },
];

/**
 * Get configuration for a specific element type
 */
export function getConfigForElementType(type: string): ElementTypeConfig | undefined {
  return DEFAULT_ELEMENT_CONFIGS.find((config) => config.excalidraw_type === type);
}

/**
 * Check if an element type is a connector (arrow or line)
 */
export function isConnectorType(type: string): boolean {
  const config = getConfigForElementType(type);
  return config?.is_connector ?? false;
}

/**
 * Get the title prefix for an element type
 */
export function getTitlePrefix(type: string): string {
  const config = getConfigForElementType(type);
  return config?.title_prefix ?? 'Element';
}

/**
 * Check if an element type supports content
 */
export function supportsContent(type: string): boolean {
  const config = getConfigForElementType(type);
  return config?.supports_content ?? false;
}

/**
 * Check if an element type supports connections
 */
export function supportsConnections(type: string): boolean {
  const config = getConfigForElementType(type);
  return config?.supports_connections ?? false;
}
