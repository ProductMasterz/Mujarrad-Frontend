// src/types/graph.ts

import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import { Node, Attribute, NodeType, AttributeKey } from './backend-dtos';

/**
 * Extended ReactFlow node with our domain data
 */
export interface GraphNode extends ReactFlowNode {
  id: string; // ReactFlow requires string IDs
  type: 'custom'; // Our custom node renderer
  data: {
    node: Node; // Backend node entity
    label: string; // Display label
    nodeType: NodeType;
  };
  position: { x: number; y: number };
}

/**
 * Custom data for graph edges
 */
export interface GraphEdgeData {
  attribute: Attribute; // Backend attribute entity
  attributeKey: AttributeKey;
  label?: string;
}

/**
 * Extended ReactFlow edge with our domain data
 */
export type GraphEdge = ReactFlowEdge<GraphEdgeData> & {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type?: 'custom'; // Our custom edge renderer
  data?: GraphEdgeData;
  animated?: boolean;
  style?: React.CSSProperties;
};

/**
 * Full graph data structure
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
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
