/**
 * Graph utilities for building and transforming graph data
 * Converts domain entities to ReactFlow-compatible format
 */

import type { Node, Attribute } from '@/types/backend-dtos';
import {
  GraphNode,
  GraphEdge,
  GraphData,
  BuildGraphDataParams,
  GraphViewMode,
} from '@/types/graph';

/**
 * Detect bidirectional edges (A→B and B→A both exist)
 * @param attributes - All attributes to analyze
 * @returns Set of attribute IDs that are part of bidirectional pairs
 */
export function detectBidirectionalEdges(attributes: Attribute[]): Set<string> {
  const edgeMap = new Map<string, Attribute[]>(); // sourceId -> Attributes[]
  const bidirectional = new Set<string>();

  // Build edge map
  for (const attr of attributes) {
    const key = attr.sourceNodeId.toString();
    if (!edgeMap.has(key)) {
      edgeMap.set(key, []);
    }
    edgeMap.get(key)!.push(attr);
  }

  // Check for bidirectional pairs (must have matching attribute types)
  for (const attr of attributes) {
    const { id, sourceNodeId, targetNodeId, attributeName } = attr;
    // Check if reverse edge exists with matching type
    const reverseEdges = edgeMap.get(targetNodeId.toString());
    if (reverseEdges) {
      const hasReverse = reverseEdges.some(
        reverseAttr =>
          reverseAttr.targetNodeId.toString() === sourceNodeId.toString() &&
          reverseAttr.attributeName === attributeName
      );
      if (hasReverse) {
        bidirectional.add(id.toString());
      }
    }
  }

  return bidirectional;
}

/**
 * Build graph data from nodes and attributes
 * Filters based on view mode and transforms to ReactFlow format
 * @param nodes - Array of nodes
 * @param attributes - Array of attributes (relationships)
 * @param viewMode - Graph view mode configuration
 * @param selectedNodeId - Currently selected node ID (optional)
 * @returns Graph data with nodes and edges for ReactFlow
 */
export function buildGraphData(
  nodes: Node[],
  attributes: Attribute[],
  viewMode: GraphViewMode,
  selectedNodeId: string | null = null
): GraphData {

  // Filter nodes based on view mode
  const filteredNodes = nodes.filter(node => {
    const nodeTypeStr = node.nodeType.toString().toUpperCase();
    if (nodeTypeStr === 'CONTEXT' && !viewMode.showContext) return false;
    if (nodeTypeStr === 'REGULAR' && !viewMode.showRegular) return false;
    return true;
  });

  // Create node ID set for quick lookup
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id.toString()));

  // Filter attributes based on view mode and visible nodes
  const filteredAttributes = attributes.filter(attr => {
    // Only show edges between visible nodes
    if (!visibleNodeIds.has(attr.sourceNodeId.toString())) return false;
    if (!visibleNodeIds.has(attr.targetNodeId.toString())) return false;

    // Filter by edge type (check both attributeName and attributeType)
    const attrTypeStr = (attr.attributeName || attr.attributeType || '').toString().toLowerCase();
    if (attrTypeStr === 'contains' && !viewMode.showContains) return false;
    if (attrTypeStr === 'references' && !viewMode.showReferences) return false;

    return true;
  });

  // Detect bidirectional edges
  const bidirectionalSet = detectBidirectionalEdges(filteredAttributes);

  // Transform nodes to GraphNodes
  const graphNodes: GraphNode[] = filteredNodes.map((node, index) => ({
    id: node.id.toString(),
    type: node.nodeType.toLowerCase() === 'context' ? 'context' : 'regular',
    data: {
      node,
      label: node.title,
      isSelected: node.id.toString() === selectedNodeId,
    },
    position: calculateNodePosition(index, filteredNodes.length),
  }));

  // Transform attributes to GraphEdges
  const graphEdges: GraphEdge[] = filteredAttributes.map(attr => {
    const isBidirectional = bidirectionalSet.has(attr.id.toString());
    const attrType = (attr.attributeName || attr.attributeType || '').toLowerCase();
    // Get label from attributeValue.label or fall back to attributeName
    const labelValue = attr.attributeValue?.label;
    const label = typeof labelValue === 'string' ? labelValue : attr.attributeName;

    return {
      id: attr.id.toString(),
      source: attr.sourceNodeId.toString(),
      target: attr.targetNodeId.toString(),
      type: isBidirectional ? 'bidirectional' : attrType === 'contains' ? 'contains' : 'default',
      data: {
        attribute: attr,
        isBidirectional,
        label,
      },
      animated: attrType === 'references',
    };
  });

  return {
    nodes: graphNodes,
    edges: graphEdges,
  };
}

/**
 * Calculate node position using a simple circular layout
 * @param index - Node index
 * @param total - Total number of nodes
 * @returns Position coordinates
 */
function calculateNodePosition(index: number, total: number): { x: number; y: number } {
  const radius = Math.max(300, total * 50); // Scale radius with node count
  const angle = (2 * Math.PI * index) / total;

  return {
    x: Math.cos(angle) * radius + 500, // Center at (500, 500)
    y: Math.sin(angle) * radius + 500,
  };
}

/**
 * Filter nodes by type
 * @param nodes - All nodes
 * @param nodeType - Type to filter by ('CONTEXT' or 'REGULAR')
 * @returns Filtered nodes
 */
export function filterNodesByType(
  nodes: Node[],
  nodeType: 'CONTEXT' | 'REGULAR'
): Node[] {
  return nodes.filter(node => node.nodeType === nodeType);
}

/**
 * Get all connected nodes for a given node
 * @param nodeId - The node to find connections for
 * @param attributes - All attributes
 * @returns Set of connected node IDs
 */
export function getConnectedNodes(nodeId: string, attributes: Attribute[]): Set<string> {
  const connected = new Set<string>();

  for (const attr of attributes) {
    if (attr.sourceNodeId.toString() === nodeId) {
      connected.add(attr.targetNodeId.toString());
    }
    if (attr.targetNodeId.toString() === nodeId) {
      connected.add(attr.sourceNodeId.toString());
    }
  }

  return connected;
}

/**
 * Default graph view mode (show everything)
 */
export const DEFAULT_GRAPH_VIEW_MODE: GraphViewMode = {
  showContext: true,
  showRegular: true,
  showContains: true,
  showReferences: true,
};
