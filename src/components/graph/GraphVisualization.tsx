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
import { getNodeEntityType } from '@/lib/entity-types';
import { useEntityTypeStore } from '@/stores/entityType.store';
import type { Node, Attribute } from '@/types/backend-dtos';
import { buildGraphData } from '@/lib/graph-utils';
import { useGraphStore } from '@/stores/graphStore';
import { GraphControls } from './GraphControls';
import { CustomNode } from './CustomNode';
import { useTheme } from 'next-themes';
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const getEntityType = useEntityTypeStore((state) => state.getType);

  const semanticTypes = useMemo(() => {
    const typeKeys = nodes
      .map((node) => getNodeEntityType(node))
      .filter((type) => type && type !== 'unknown');

    return Array.from(new Set(typeKeys))
      .map((typeKey) => getEntityType(typeKey))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [nodes, getEntityType]);

  const getMiniMapEntityColor = (data: unknown) => {
    const graphNodeData = data as {
      entityType?: string;
      node?: Node;
    };

    const entityType =
      graphNodeData.entityType || getNodeEntityType(graphNodeData.node);

    return getEntityType(entityType).color;
  };

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
        fill: isDark ? '#ffffff' : '#111827',
        color: isDark ? '#ffffff' : '#111827',
      },
      labelBgStyle: {
        fill: isDark ? '#0f172a' : '#ffffff',
        fillOpacity: 0.92,
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
          fill: isDark ? '#ffffff' : '#111827',
          color: isDark ? '#ffffff' : '#111827',
        },
        labelBgStyle: {
          fill: isDark ? '#0f172a' : '#ffffff',
          fillOpacity: 0.92,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      }))
    );
  }, [graphData.edges, setFlowEdges, isDark]);

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
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No nodes to display in graph
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <GraphControls
        viewMode={viewMode}
        semanticTypes={semanticTypes}
        onViewModeChange={handleViewModeChange}
      />

      <div className="flex-1 overflow-hidden rounded-[20px] border border-border bg-background">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="hsl(var(--border))" gap={20} />
          <Controls />
         <MiniMap
          pannable
          zoomable
          nodeStrokeColor={(n) => getMiniMapEntityColor(n.data)}
          nodeColor={(n) => {
            const color = getMiniMapEntityColor(n.data);
            return isDark ? `${color}55` : `${color}22`;
          }}
          maskColor={isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.7)'}
          style={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
          }}
        />
        </ReactFlow>
      </div>
    </div>
  );
}