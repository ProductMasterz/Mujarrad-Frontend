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
  const filteredNodes = nodes.filter((node) => {
    let details: Record<string, unknown> | undefined;

    if (typeof node.nodeDetails === 'string') {
      try {
        details = JSON.parse(node.nodeDetails);
      } catch {
        details = undefined;
      }
    } else {
      details = node.nodeDetails as Record<string, unknown> | undefined;
    }

    const chatNodeType = details?.chatNodeType;
const createdFrom = details?.createdFrom;
const role = details?.role;

const isConversation =
  chatNodeType === 'conversation' ||
  ((createdFrom === 'chat' || createdFrom === 'assistant-ui') &&
    role === 'conversation');

const isUserMessage =
  chatNodeType === 'message' &&
  role === 'user';

const isAssistantMessage =
  chatNodeType === 'message' &&
  role === 'assistant';

const isAnyMessage = isUserMessage || isAssistantMessage;

const entityType =
  typeof details?.entityType === 'string'
    ? details.entityType.toLowerCase()
    : undefined;

const isEntity =
  entityType === 'person' ||
  entityType === 'place' ||
  entityType === 'action' ||
  entityType === 'topic' ||
  entityType === 'event';

const isBlock =
  !!details?.blockType ||
  String(node.title || '').startsWith('Block ');

const nodeTypeStr = node.nodeType.toString().toUpperCase();

const isRegular = nodeTypeStr === 'REGULAR';
const isContext = nodeTypeStr === 'CONTEXT';
const isAssumption = nodeTypeStr === 'ASSUMPTION';
const isTemplate = nodeTypeStr === 'TEMPLATE';

// Chat group
if (isConversation && (!viewMode.showChat || !viewMode.showConversationNodes)) return false;
if (isUserMessage && (!viewMode.showChat || !viewMode.showUserMessages)) return false;
if (isAssistantMessage && (!viewMode.showChat || !viewMode.showAssistantMessages)) return false;

// Entity group
if (entityType === 'person' && (!viewMode.showEntities || !viewMode.showPerson)) return false;
if (entityType === 'place' && (!viewMode.showEntities || !viewMode.showPlace)) return false;
if (entityType === 'action' && (!viewMode.showEntities || !viewMode.showAction)) return false;
if (entityType === 'topic' && (!viewMode.showEntities || !viewMode.showTopic)) return false;
if (entityType === 'event' && (!viewMode.showEntities || !viewMode.showEvent)) return false;

// System group
if (isRegular && !isEntity && !isConversation && !isAnyMessage && (!viewMode.showSystem || !viewMode.showRegular)) return false;
if (isContext && (!viewMode.showSystem || !viewMode.showContext)) return false;
if (isAssumption && (!viewMode.showSystem || !viewMode.showAssumption)) return false;
if (isTemplate && (!viewMode.showSystem || !viewMode.showTemplate)) return false;
if (isBlock && (!viewMode.showSystem || !viewMode.showBlocks)) return false;

return true;
  });

  // Create node ID set for quick lookup
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id.toString()));

  // Filter attributes based on view mode and visible nodes
  const filteredAttributes = attributes.filter((attr) => {
  if (!visibleNodeIds.has(attr.sourceNodeId.toString())) return false;
  if (!visibleNodeIds.has(attr.targetNodeId.toString())) return false;

  const attrTypeStr = (attr.attributeName || attr.attributeType || '').toString().toLowerCase();

  const sourceNode = nodes.find((n) => n.id.toString() === attr.sourceNodeId.toString());
  const targetNode = nodes.find((n) => n.id.toString() === attr.targetNodeId.toString());

  const parseDetails = (node?: Node) => {
    if (!node?.nodeDetails) return undefined;
    if (typeof node.nodeDetails === 'string') {
      try {
        return JSON.parse(node.nodeDetails) as Record<string, unknown>;
      } catch {
        return undefined;
      }
    }
    return node.nodeDetails as Record<string, unknown>;
  };

  const sourceDetails = parseDetails(sourceNode);
  const targetDetails = parseDetails(targetNode);

  const sourceChatType = sourceDetails?.chatNodeType;
  const targetChatType = targetDetails?.chatNodeType;

  const sourceRole = sourceDetails?.role;
  const targetRole = targetDetails?.role;

  const sourceCreatedFrom = sourceDetails?.createdFrom;
  const targetCreatedFrom = targetDetails?.createdFrom;

  const sourceIsConversation =
    sourceChatType === 'conversation' ||
    ((sourceCreatedFrom === 'chat' || sourceCreatedFrom === 'assistant-ui') &&
      sourceRole === 'conversation');

  const targetIsConversation =
    targetChatType === 'conversation' ||
    ((targetCreatedFrom === 'chat' || targetCreatedFrom === 'assistant-ui') &&
      targetRole === 'conversation');

  const sourceIsMessage =
    sourceChatType === 'message' ||
    ((sourceCreatedFrom === 'chat' || sourceCreatedFrom === 'assistant-ui') &&
      (sourceRole === 'user' || sourceRole === 'assistant'));

  const targetIsMessage =
    targetChatType === 'message' ||
    ((targetCreatedFrom === 'chat' || targetCreatedFrom === 'assistant-ui') &&
      (targetRole === 'user' || targetRole === 'assistant'));

  const sourceEntityType =
    typeof sourceDetails?.entityType === 'string'
      ? sourceDetails.entityType.toLowerCase()
      : undefined;

  const targetEntityType =
    typeof targetDetails?.entityType === 'string'
      ? targetDetails.entityType.toLowerCase()
      : undefined;

  const sourceIsEntity = !!sourceEntityType;
  const targetIsEntity = !!targetEntityType;

  const isChatRelation =
    attrTypeStr === 'contains' &&
    ((sourceIsConversation && targetIsMessage) ||
      (targetIsConversation && sourceIsMessage));

  const isEntityRelation =
    attrTypeStr !== 'contains' &&
    attrTypeStr !== 'references' &&
    sourceIsEntity &&
    targetIsEntity;

  if (isChatRelation && (!viewMode.showChat || !viewMode.showChatRelations)) return false;
  if (isEntityRelation && (!viewMode.showEntities || !viewMode.showEntityRelations)) return false;
  if (attrTypeStr === 'references' && !viewMode.showReferences) return false;

  return true;
});

  // Detect bidirectional edges
  const bidirectionalSet = detectBidirectionalEdges(filteredAttributes);


  // Transform nodes to GraphNodes
  const graphNodes: GraphNode[] = filteredNodes.map((node, index) => {
    let details: Record<string, unknown> | undefined;

    if (typeof node.nodeDetails === 'string') {
      try {
        details = JSON.parse(node.nodeDetails);
      } catch {
        details = undefined;
      }
    } else {
      details = node.nodeDetails as Record<string, unknown> | undefined;
    }

    const entityType =
      typeof details?.entityType === 'string'
        ? details.entityType
        : undefined;

    return {
      id: node.id.toString(),
      type: 'custom',
      data: {
        node,
        label: node.title,
        isSelected: node.id.toString() === selectedNodeId,
        nodeType: node.nodeType,
        entityType,
      },
      position: calculateNodePosition(index, filteredNodes.length),
    };
  });

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
  // Chat
  showChat: true,
  showConversationNodes: false,
  showUserMessages: false,
  showAssistantMessages: false,
  showChatRelations: false,

  // Entities
  showEntities: true,
  showPerson: true,
  showPlace: true,
  showAction: true,
  showTopic: true,
  showEvent: true,
  showEntityRelations: true,

  // System
  showSystem: true,
  showRegular: true,
  showContext: true,
  showAssumption: true,
  showTemplate: true,
  showBlocks: false,

  // Other
  showReferences: true,
};