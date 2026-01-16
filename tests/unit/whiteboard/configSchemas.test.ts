/**
 * Unit tests for Config Schemas
 * Generated with assistance from ollama:llama3.1:8b
 */

import {
  DEFAULT_ELEMENT_CONFIGS,
  getConfigForElementType,
  isConnectorType,
  getTitlePrefix,
  supportsContent,
  supportsConnections,
} from '@/lib/whiteboard/configSchemas';

describe('Config Schemas', () => {
  describe('DEFAULT_ELEMENT_CONFIGS', () => {
    it('has configs for all 9 element types', () => {
      expect(DEFAULT_ELEMENT_CONFIGS).toHaveLength(9);

      const types = DEFAULT_ELEMENT_CONFIGS.map((c) => c.excalidraw_type);
      expect(types).toContain('rectangle');
      expect(types).toContain('ellipse');
      expect(types).toContain('diamond');
      expect(types).toContain('text');
      expect(types).toContain('freedraw');
      expect(types).toContain('image');
      expect(types).toContain('arrow');
      expect(types).toContain('line');
      expect(types).toContain('frame');
    });

    it('all configs have REGULAR node type', () => {
      DEFAULT_ELEMENT_CONFIGS.forEach((config) => {
        expect(config.mujarrad_node_type).toBe('REGULAR');
      });
    });

    it('all configs have required fields', () => {
      DEFAULT_ELEMENT_CONFIGS.forEach((config) => {
        expect(config).toHaveProperty('excalidraw_type');
        expect(config).toHaveProperty('mujarrad_node_type');
        expect(config).toHaveProperty('element_subtype');
        expect(config).toHaveProperty('title_source');
        expect(config).toHaveProperty('supports_content');
        expect(config).toHaveProperty('supports_connections');
        expect(config).toHaveProperty('is_connector');
      });
    });
  });

  describe('getConfigForElementType', () => {
    it.each([
      'rectangle',
      'ellipse',
      'diamond',
      'text',
      'freedraw',
      'image',
      'arrow',
      'line',
      'frame',
    ])('returns config for %s element type', (type) => {
      const config = getConfigForElementType(type);
      expect(config).toBeDefined();
      expect(config?.excalidraw_type).toBe(type);
    });

    it('returns undefined for unknown type', () => {
      const config = getConfigForElementType('unknown');
      expect(config).toBeUndefined();
    });
  });

  describe('isConnectorType', () => {
    it('returns true for arrow', () => {
      expect(isConnectorType('arrow')).toBe(true);
    });

    it('returns true for line', () => {
      expect(isConnectorType('line')).toBe(true);
    });

    it('returns false for shapes', () => {
      expect(isConnectorType('rectangle')).toBe(false);
      expect(isConnectorType('ellipse')).toBe(false);
      expect(isConnectorType('diamond')).toBe(false);
      expect(isConnectorType('text')).toBe(false);
    });

    it('returns false for unknown types', () => {
      expect(isConnectorType('unknown')).toBe(false);
    });
  });

  describe('getTitlePrefix', () => {
    it.each([
      ['rectangle', 'Rectangle'],
      ['ellipse', 'Ellipse'],
      ['diamond', 'Diamond'],
      ['text', 'Text'],
      ['freedraw', 'Drawing'],
      ['image', 'Image'],
      ['arrow', 'Arrow'],
      ['line', 'Line'],
      ['frame', 'Frame'],
    ])('returns %s for %s element', (type, prefix) => {
      expect(getTitlePrefix(type)).toBe(prefix);
    });

    it('returns Element for unknown type', () => {
      expect(getTitlePrefix('unknown')).toBe('Element');
    });
  });

  describe('supportsContent', () => {
    it('returns true for text element', () => {
      expect(supportsContent('text')).toBe(true);
    });

    it('returns false for shapes', () => {
      expect(supportsContent('rectangle')).toBe(false);
      expect(supportsContent('ellipse')).toBe(false);
    });
  });

  describe('supportsConnections', () => {
    it('returns true for shapes that can be connected', () => {
      expect(supportsConnections('rectangle')).toBe(true);
      expect(supportsConnections('ellipse')).toBe(true);
      expect(supportsConnections('text')).toBe(true);
    });

    it('returns false for freedraw', () => {
      expect(supportsConnections('freedraw')).toBe(false);
    });
  });
});
