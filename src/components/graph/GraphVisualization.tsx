/**
 * GraphVisualization component
 * React Flow wrapper for graph display
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { Node, Attribute } from '@/types/backend-dtos';
import { buildGraphData } from '@/lib/graph-utils';
import { useNavigationStore } from '@/stores/navigationStore';
import { GraphControls } from './GraphControls';

interface GraphVisualizationProps {
  nodes: Node[];
  attributes: Attribute[];
  onNodeClick?: (nodeId: string) => void;
}

/**
 * GraphVisualization component
 * Displays nodes and edges using React Flow
 */
export function GraphVisualization({
  nodes,
  attributes,
  onNodeClick,
}: GraphVisualizationProps) {
  const { graphViewMode, setGraphViewMode, selectedNodeId, setSelectedNode } =
    useNavigationStore();

  // Build graph data based on view mode
  const graphData = useMemo(() => {
    return buildGraphData({
      nodes,
      attributes,
      viewMode: graphViewMode,
      selectedNodeId,
    });
  }, [nodes, attributes, graphViewMode, selectedNodeId]);

  // Convert to ReactFlow format
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    graphData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        label: node.data.label,
      },
    }))
  );

  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(
    graphData.edges.map(edge => ({
      ...edge,
      label: edge.data.label,
    }))
  );

  // Update flow nodes when graph data changes
  React.useEffect(() => {
    setFlowNodes(
      graphData.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          label: node.data.label,
        },
      }))
    );
  }, [graphData.nodes, setFlowNodes]);

  // Update flow edges when graph data changes
  React.useEffect(() => {
    setFlowEdges(
      graphData.edges.map(edge => ({
        ...edge,
        label: edge.data.label,
      }))
    );
  }, [graphData.edges, setFlowEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      setSelectedNode(node.id);
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick, setSelectedNode]
  );

  const handleViewModeChange = useCallback(
    (mode: Partial<typeof graphViewMode>) => {
      setGraphViewMode(mode);
    },
    [setGraphViewMode]
  );

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No nodes to display in graph
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <GraphControls viewMode={graphViewMode} onViewModeChange={handleViewModeChange} />

      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
