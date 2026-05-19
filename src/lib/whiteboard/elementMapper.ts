/**
 * Element Mapper - Maps Excalidraw elements to Mujarrad Nodes
 * Generated with assistance from ollama:llama3.1:8b
 */

import {
  ExcalidrawElement,
  ExcalidrawElementType,
  WhiteboardNode,
  WhiteboardElementSubtype,
  CreateWhiteboardNodeDTO,
  CreateConnectorDTO,
} from '@/types/whiteboard';
import { getConfigForElementType, isConnectorType } from './configSchemas';

/**
 * Maps an Excalidraw element to a CreateWhiteboardNodeDTO
 */
export function mapExcalidrawToNode(
  element: ExcalidrawElement,
  spaceSlug: string,
  index: number = 0
): CreateWhiteboardNodeDTO {
  const config = getConfigForElementType(element.type);
  const subtype = getElementSubtype(element.type);
  const title = generateTitle(element, index);

  return {
    title,
    nodeType: 'REGULAR',
    nodeDetails: {
      element_subtype: subtype,
      excalidraw_element: element,
      whiteboard_meta: {
        space_slug: spaceSlug,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        z_index: index,
      },
    },
  };
}

/**
 * Maps a WhiteboardNode back to an Excalidraw element
 */
export function mapNodeToExcalidraw(node: WhiteboardNode): ExcalidrawElement {
  return node.nodeDetails.excalidraw_element;
}

/**
 * Maps an arrow element to a connector attribute DTO
 */
export function mapArrowToAttribute(
  arrow: ExcalidrawElement,
  sourceNodeId: string,
  targetNodeId: string
): CreateConnectorDTO {
  return {
    target_node_id: targetNodeId,
    attribute_key: 'connects_to',
    attribute_value: {
      excalidraw_element: arrow,
      connector_meta: {
        source_element_id: arrow.startBinding?.elementId || '',
        target_element_id: arrow.endBinding?.elementId || '',
        bidirectional: arrow.startArrowhead !== null && arrow.endArrowhead !== null,
        label: arrow.text,
      },
    },
  };
}

/**
 * Generates a title for an element based on its type and index
 */
export function generateTitle(element: ExcalidrawElement, index: number): string {
  switch (element.type) {
    case 'text':
      // Use first 50 chars of text content
      const textContent = element.text || 'Text';
      return textContent.length > 50 ? textContent.substring(0, 47) + '...' : textContent;
    case 'rectangle':
      return `Rectangle ${index + 1}`;
    case 'ellipse':
      return `Ellipse ${index + 1}`;
    case 'diamond':
      return `Diamond ${index + 1}`;
    case 'freedraw':
      return `Drawing ${index + 1}`;
    case 'image':
      return `Image ${index + 1}`;
    case 'arrow':
      return `Arrow ${index + 1}`;
    case 'line':
      return `Line ${index + 1}`;
    case 'frame':
      return `Frame ${index + 1}`;
    default:
      return `Element ${index + 1}`;
  }
}

/**
 * Gets the WhiteboardElementSubtype for an Excalidraw element type
 */
export function getElementSubtype(type: ExcalidrawElementType): WhiteboardElementSubtype {
  switch (type) {
    case 'rectangle':
      return 'shape_rectangle';
    case 'ellipse':
      return 'shape_ellipse';
    case 'diamond':
      return 'shape_diamond';
    case 'text':
      return 'text';
    case 'freedraw':
      return 'drawing';
    case 'image':
      return 'image';
    case 'frame':
      return 'frame';
    default:
      return 'shape_rectangle';
  }
}

/**
 * Finds the bound text content for an element (rectangle, arrow, etc.)
 * In Excalidraw, text inside shapes/arrows is a separate element with containerId.
 */
export function getBoundText(
  element: ExcalidrawElement,
  allElements: ExcalidrawElement[]
): string | undefined {
  const textBinding = element.boundElements?.find(b => b.type === 'text');
  if (!textBinding) return undefined;

  const textElement = allElements.find(el => el.id === textBinding.id && !el.isDeleted);
  return textElement?.text || undefined;
}

/**
 * Checks if an element has bindings (is connected to other elements)
 */
export function hasBindings(element: ExcalidrawElement): boolean {
  return !!(element.startBinding || element.endBinding);
}

/**
 * Gets bound element IDs from an arrow/line element
 */
export function getBoundElementIds(element: ExcalidrawElement): { start?: string; end?: string } {
  return {
    start: element.startBinding?.elementId,
    end: element.endBinding?.elementId,
  };
}

/**
 * Filters elements into shapes and connectors
 */
export function categorizeElements(elements: ExcalidrawElement[]): {
  shapes: ExcalidrawElement[];
  connectors: ExcalidrawElement[];
} {
  const shapes: ExcalidrawElement[] = [];
  const connectors: ExcalidrawElement[] = [];

  for (const element of elements) {
    if (isConnectorType(element.type) && hasBindings(element)) {
      connectors.push(element);
    } else {
      shapes.push(element);
    }
  }

  return { shapes, connectors };
}
