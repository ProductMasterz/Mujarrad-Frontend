// src/types/graph.ts

import { Node as ReactFlowNode } from 'reactflow';
import type { Node, Attribute } from './backend-dtos';

/**
 * Extended ReactFlow node with our domain data
 */
export interface GraphNode extends ReactFlowNode {
  id: string; // ReactFlow requires string IDs
  type: string;
  data: {
    node: Node; // Backend node entity
    label: string; // Display label
    isSelected: boolean;
    nodeType: Node['nodeType'];
    entityType?: string;
  };
  position: { x: number; y: number };
}

/**
 * Custom data for graph edges
 */
export interface GraphEdgeData {
  attribute: Attribute; // Backend attribute entity
  isBidirectional: boolean; // True if A→B and B→A both exist
  label?: string;
}

/**
 * Extended ReactFlow edge with our domain data
 */
export interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: 'default' | 'bidirectional' | 'contains'; // Edge types
  data: GraphEdgeData;
  animated?: boolean;
  style?: React.CSSProperties;
}

/**
 * Full graph data structure
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Graph view mode for filtering nodes/edges
 */
export interface GraphViewMode {
  // Chat
  showChat: boolean;
  showConversationNodes: boolean;
  showUserMessages: boolean;
  showAssistantMessages: boolean;
  showChatRelations: boolean;

  // Entities / semantic types
  showEntities: boolean;
  showEntityRelations: boolean;
  hiddenSemanticTypes: string[];

  // System
  showSystem: boolean;
  showRegular: boolean;
  showContext: boolean;
  showAssumption: boolean;
  showTemplate: boolean;
  showBlocks: boolean;

  // Legacy / generic relations if still needed
  showReferences: boolean;
}

/**
 * Layout algorithm options
 */
export type LayoutAlgorithm = 'dagre' | 'force' | 'hierarchical';

/**
 * Graph viewport state
 */
export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Parameters for building graph data
 */
export interface BuildGraphDataParams {
  nodes: Node[];
  attributes: Attribute[];
  viewMode: GraphViewMode;
  selectedNodeId?: string | null;
}
