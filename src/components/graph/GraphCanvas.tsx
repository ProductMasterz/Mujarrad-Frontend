'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from 'next-themes';
import { useGraphData } from '@/hooks/api';
import { CustomNode } from './CustomNode';
import { Spinner } from '@/components/ui/spinner';
import { getNodeEntityType } from '@/lib/entity-types';
import { useEntityTypeStore } from '@/stores/entityType.store';
import type { Node as BackendNode } from '@/types/backend-dtos';

interface GraphCanvasProps {
  spaceSlug: string;
}

const nodeTypes = {
  custom: CustomNode,
};

export function GraphCanvas({ spaceSlug }: GraphCanvasProps) {
  const { data: graphData, isLoading } = useGraphData(spaceSlug);
  const { resolvedTheme } = useTheme();
  const getType = useEntityTypeStore((state) => state.getType);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (graphData) {
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
    }
  }, [graphData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';
  const getMiniMapEntityColor = (data: unknown) => {
    const graphData = data as {
      entityType?: string;
      node?: BackendNode;
    };

    const entityType =
      graphData.entityType || getNodeEntityType(graphData.node);

    return getType(entityType).color;
  };
  return (
    <div className="h-full w-full rounded-[20px] bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background
          color={isDark ? '#334155' : '#e5e7eb'}
          gap={18}
          size={1}
        />
        <Controls />
        <MiniMap
          pannable
          zoomable
          className="!rounded-xl !border !border-border !bg-background"
          nodeStrokeColor={(n) => getMiniMapEntityColor(n.data)}
          nodeColor={(n) => {
            const color = getMiniMapEntityColor(n.data);
            return isDark ? `${color}55` : `${color}22`;
          }}
          maskColor={isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.7)'}
        />
      </ReactFlow>
    </div>
  );
}