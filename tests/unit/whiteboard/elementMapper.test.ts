/**
 * Unit tests for Element Mapper utility
 * Generated with assistance from ollama:llama3.1:8b
 */

import {
  mapExcalidrawToNode,
  mapNodeToExcalidraw,
  generateTitle,
  getElementSubtype,
  categorizeElements,
  hasBindings,
} from '@/lib/whiteboard/elementMapper';
import {
  ExcalidrawElement,
  WhiteboardNode,
  WhiteboardElementSubtype,
} from '@/types/whiteboard';

// Mock element factory
const createMockElement = (
  type: string,
  overrides: Partial<ExcalidrawElement> = {}
): ExcalidrawElement => ({
  id: `test-${type}-${Math.random()}`,
  type: type as any,
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  angle: 0,
  strokeColor: '#000000',
  backgroundColor: '#ffffff',
  fillStyle: 'solid',
  strokeWidth: 1,
  strokeStyle: 'solid',
  roughness: 0,
  opacity: 100,
  groupIds: [],
  frameId: null,
  version: 1,
  versionNonce: 123,
  isDeleted: false,
  boundElements: null,
  ...overrides,
});

// Mock node factory
const createMockNode = (element: ExcalidrawElement): WhiteboardNode => ({
  id: `node-${element.id}`,
  title: generateTitle(element, 0),
  node_type: 'REGULAR',
  node_details: {
    element_subtype: getElementSubtype(element.type as any),
    excalidraw_element: element,
    whiteboard_meta: {
      space_slug: 'test-space',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      z_index: 0,
    },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
});

describe('Element Mapper Utility', () => {
  describe('mapExcalidrawToNode', () => {
    it('converts rectangle element to node', () => {
      const element = createMockElement('rectangle');
      const result = mapExcalidrawToNode(element, 'test-space', 0);

      expect(result.title).toBe('Rectangle 1');
      expect(result.node_type).toBe('REGULAR');
      expect(result.node_details.element_subtype).toBe('shape_rectangle');
      expect(result.node_details.excalidraw_element).toEqual(element);
    });

    it('converts ellipse element to node', () => {
      const element = createMockElement('ellipse');
      const result = mapExcalidrawToNode(element, 'test-space', 1);

      expect(result.title).toBe('Ellipse 2');
      expect(result.node_details.element_subtype).toBe('shape_ellipse');
    });

    it('converts text element using text content as title', () => {
      const element = createMockElement('text', { text: 'Hello World' });
      const result = mapExcalidrawToNode(element, 'test-space', 0);

      expect(result.title).toBe('Hello World');
      expect(result.node_details.element_subtype).toBe('text');
    });

    it('truncates long text titles', () => {
      const longText = 'This is a very long text that should be truncated because it exceeds fifty characters';
      const element = createMockElement('text', { text: longText });
      const result = mapExcalidrawToNode(element, 'test-space', 0);

      expect(result.title.length).toBeLessThanOrEqual(50);
      expect(result.title).toContain('...');
    });
  });

  describe('mapNodeToExcalidraw', () => {
    it('extracts excalidraw element from node', () => {
      const element = createMockElement('rectangle');
      const node = createMockNode(element);
      const result = mapNodeToExcalidraw(node);

      expect(result).toEqual(element);
    });
  });

  describe('generateTitle', () => {
    it.each([
      ['rectangle', 0, 'Rectangle 1'],
      ['ellipse', 1, 'Ellipse 2'],
      ['diamond', 2, 'Diamond 3'],
      ['freedraw', 0, 'Drawing 1'],
      ['image', 0, 'Image 1'],
      ['arrow', 0, 'Arrow 1'],
      ['line', 0, 'Line 1'],
    ])('generates correct title for %s element', (type, index, expectedTitle) => {
      const element = createMockElement(type);
      const result = generateTitle(element, index);
      expect(result).toBe(expectedTitle);
    });

    it('uses text content for text elements', () => {
      const element = createMockElement('text', { text: 'My Note' });
      const result = generateTitle(element, 0);
      expect(result).toBe('My Note');
    });
  });

  describe('getElementSubtype', () => {
    it.each([
      ['rectangle', 'shape_rectangle'],
      ['ellipse', 'shape_ellipse'],
      ['diamond', 'shape_diamond'],
      ['text', 'text'],
      ['freedraw', 'drawing'],
      ['image', 'image'],
      ['frame', 'frame'],
    ])('maps %s to %s subtype', (type, expectedSubtype) => {
      const result = getElementSubtype(type as any);
      expect(result).toBe(expectedSubtype);
    });
  });

  describe('categorizeElements', () => {
    it('separates shapes from connectors', () => {
      const rectangle = createMockElement('rectangle');
      const arrow = createMockElement('arrow', {
        startBinding: { elementId: 'a', focus: 0, gap: 0 },
        endBinding: { elementId: 'b', focus: 0, gap: 0 },
      });

      const result = categorizeElements([rectangle, arrow]);

      expect(result.shapes).toHaveLength(1);
      expect(result.shapes[0]).toEqual(rectangle);
      expect(result.connectors).toHaveLength(1);
      expect(result.connectors[0]).toEqual(arrow);
    });

    it('treats unbound arrows as shapes', () => {
      const arrow = createMockElement('arrow'); // No bindings

      const result = categorizeElements([arrow]);

      expect(result.shapes).toHaveLength(1);
      expect(result.connectors).toHaveLength(0);
    });
  });

  describe('hasBindings', () => {
    it('returns true for elements with start binding', () => {
      const element = createMockElement('arrow', {
        startBinding: { elementId: 'a', focus: 0, gap: 0 },
      });
      expect(hasBindings(element)).toBe(true);
    });

    it('returns true for elements with end binding', () => {
      const element = createMockElement('arrow', {
        endBinding: { elementId: 'b', focus: 0, gap: 0 },
      });
      expect(hasBindings(element)).toBe(true);
    });

    it('returns false for elements without bindings', () => {
      const element = createMockElement('rectangle');
      expect(hasBindings(element)).toBe(false);
    });
  });
});
