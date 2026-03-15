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
  ColorMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from 'next-themes';
import { useGraphData } from '@/hooks/api';
import { CustomNode } from './CustomNode';
import { Spinner } from '@/components/ui/spinner';

interface GraphCanvasProps {
  spaceSlug: string;
}

const nodeTypes = {
  custom: CustomNode,
};

export function GraphCanvas({ spaceSlug }: GraphCanvasProps) {
  const { data: graphData, isLoading } = useGraphData(spaceSlug);
  const { resolvedTheme } = useTheme();

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

  return (
    <div className="h-full w-full rounded-[20px] bg-background">
      <ReactFlow
        colorMode={(isDark ? 'dark' : 'light') as ColorMode}
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
          nodeStrokeColor={(n) => {
            const entityType = (n.data as { entityType?: string })?.entityType?.toLowerCase?.();
            if (entityType === 'person') return '#3b82f6';
            if (entityType === 'place') return '#10b981';
            if (entityType === 'action') return '#f43f5e';
            if (entityType === 'topic') return '#8b5cf6';
            if (entityType === 'event') return '#f97316';
            return isDark ? '#64748b' : '#94a3b8';
          }}
          nodeColor={(n) => {
            const entityType = (n.data as { entityType?: string })?.entityType?.toLowerCase?.();
            if (entityType === 'person') return isDark ? '#172554' : '#dbeafe';
            if (entityType === 'place') return isDark ? '#052e2b' : '#d1fae5';
            if (entityType === 'action') return isDark ? '#4c0519' : '#ffe4e6';
            if (entityType === 'topic') return isDark ? '#2e1065' : '#ede9fe';
            if (entityType === 'event') return isDark ? '#431407' : '#ffedd5';
            return isDark ? '#1f2937' : '#f8fafc';
          }}
          maskColor={isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.7)'}
        />
      </ReactFlow>
    </div>
  );
}