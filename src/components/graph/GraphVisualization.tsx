'use client';

import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node as ReactFlowNode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { Node, Attribute } from '@/types/backend-dtos';
import { buildGraphData } from '@/lib/graph-utils';
import { useGraphStore } from '@/stores/graphStore';
import { GraphControls } from './GraphControls';
import { CustomNode } from './CustomNode';

interface GraphVisualizationProps {
  nodes: Node[];
  attributes: Attribute[];
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes = {
  custom: CustomNode,
};

export function GraphVisualization({
  nodes,
  attributes,
  onNodeClick,
}: GraphVisualizationProps) {
  const viewMode = useGraphStore((state) => state.viewMode);
  const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode);

  const graphData = useMemo(() => {
    return buildGraphData(nodes, attributes, viewMode, selectedNodeId);
  }, [nodes, attributes, viewMode, selectedNodeId]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    graphData.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        label: node.data.label,
        nodeType: node.data.node.nodeType,
      },
    }))
  );

  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(
    graphData.edges.map((edge) => ({
      ...edge,
      label: edge.data.label,
      animated: edge.animated,
      style: edge.style,
      labelStyle: {
        fontSize: 12,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: '#fff',
        fillOpacity: 0.9,
      },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
    }))
  );

  React.useEffect(() => {
    setFlowNodes(
      graphData.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          label: node.data.label,
          nodeType: node.data.node.nodeType,
        },
      }))
    );
  }, [graphData.nodes, setFlowNodes]);

  React.useEffect(() => {
    setFlowEdges(
      graphData.edges.map((edge) => ({
        ...edge,
        label: edge.data.label,
        animated: edge.animated,
        style: edge.style,
        labelStyle: {
          fontSize: 12,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: '#fff',
          fillOpacity: 0.9,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      }))
    );
  }, [graphData.edges, setFlowEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode) => {
      setSelectedNode(node.id);
      onNodeClick?.(node.id);
    },
    [onNodeClick, setSelectedNode]
  );

  const handleViewModeChange = useCallback((mode: Partial<typeof viewMode>) => {
    useGraphStore.setState((state) => ({
      viewMode: { ...state.viewMode, ...mode },
    }));
  }, [viewMode]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No nodes to display in graph
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <GraphControls viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
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