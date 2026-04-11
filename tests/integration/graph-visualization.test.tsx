import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { Node, Attribute } from '@/types/backend-dtos';

// --------------------
// Mocks FIRST
// --------------------

jest.mock('next-themes', () => ({
  __esModule: true,
  useTheme: jest.fn(),
}));

jest.mock('@/stores/graphStore', () => ({
  __esModule: true,
  useGraphStore: jest.fn(),
}));

jest.mock('@/components/graph/GraphControls', () => ({
  __esModule: true,
  GraphControls: ({
    viewMode,
    onViewModeChange,
  }: {
    viewMode: any;
    onViewModeChange: (mode: any) => void;
  }) => (
    <div data-testid="graph-controls">
      <div data-testid="graph-controls-state">{JSON.stringify(viewMode)}</div>

      <button
        type="button"
        data-testid="toggle-context"
        onClick={() => onViewModeChange({ showContext: false })}
      >
        Toggle Context
      </button>

      <button
        type="button"
        data-testid="toggle-regular"
        onClick={() => onViewModeChange({ showRegular: false })}
      >
        Toggle Regular
      </button>

      <button
        type="button"
        data-testid="toggle-contains"
        onClick={() => onViewModeChange({ showContains: false })}
      >
        Toggle Contains
      </button>

      <button
        type="button"
        data-testid="toggle-references"
        onClick={() => onViewModeChange({ showReferences: false })}
      >
        Toggle References
      </button>
    </div>
  ),
}));

jest.mock('@/components/graph/CustomNode', () => ({
  __esModule: true,
  CustomNode: () => <div data-testid="custom-node-component" />,
}));

jest.mock('@/lib/graph-utils', () => ({
  __esModule: true,
  buildGraphData: jest.fn(),
}));

jest.mock('reactflow/dist/style.css', () => ({}));

jest.mock('reactflow', () => {
  const React = require('react');

  const MockReactFlow = ({
    nodes,
    edges,
    onNodeClick,
    children,
  }: {
    nodes: any[];
    edges: any[];
    onNodeClick?: (event: any, node: any) => void;
    children?: React.ReactNode;
  }) => (
    <div data-testid="react-flow">
      <div data-testid="react-flow-nodes">
        {nodes.map((node: any) => (
          <div
            key={node.id}
            data-testid={`graph-node-${node.id}`}
            data-node-type={node.type}
            data-node-kind={node.data?.nodeType}
            onClick={() => onNodeClick?.({}, node)}
          >
            {node.data?.label}
          </div>
        ))}
      </div>

      <svg data-testid="react-flow-edges">
        <defs>
          <marker id="arrowhead-both" />
        </defs>

        {edges.map((edge: any) => (
          <g
            key={edge.id}
            data-testid={`graph-edge-${edge.id}`}
            data-edge-type={edge.type}
            data-bidirectional={String(Boolean(edge.data?.isBidirectional))}
            className={edge.className ?? ''}
          >
            <title>{edge.data?.tooltip ?? ''}</title>
            <path
              data-testid={`graph-edge-path-${edge.id}`}
              style={edge.style ?? {}}
            />
          </g>
        ))}

        {children}
      </svg>
    </div>
  );

  return {
    __esModule: true,
    default: MockReactFlow,
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
    useNodesState: (initialNodes: any[]) => [initialNodes, jest.fn(), jest.fn()],
    useEdgesState: (initialEdges: any[]) => [initialEdges, jest.fn(), jest.fn()],
  };
});

// --------------------
// Require AFTER mocks
// --------------------

const { GraphVisualization } = require('@/components/graph/GraphVisualization') as {
  GraphVisualization: React.ComponentType<any>;
};

const { useTheme } = require('next-themes') as {
  useTheme: jest.Mock;
};

const { useGraphStore } = require('@/stores/graphStore') as {
  useGraphStore: jest.Mock & { setState?: jest.Mock };
};

const { buildGraphData } = require('@/lib/graph-utils') as {
  buildGraphData: jest.Mock;
};

// --------------------
// Test data
// --------------------

const setSelectedNode = jest.fn();
const setGraphStoreState = jest.fn();

let mockGraphState: any;

const mockNodes: Node[] = [
  {
    id: 'context-1',
    spaceId: 'ws-1',
    title: 'Projects Folder',
    slug: 'projects',
    nodeType: 'CONTEXT',
    markdownContent: null,
    nodeDetails: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
  },
  {
    id: 'regular-1',
    spaceId: 'ws-1',
    title: 'Page A',
    slug: 'page-a',
    nodeType: 'REGULAR',
    markdownContent: 'Content A',
    nodeDetails: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
  },
  {
    id: 'regular-2',
    spaceId: 'ws-1',
    title: 'Page B',
    slug: 'page-b',
    nodeType: 'REGULAR',
    markdownContent: 'Content B',
    nodeDetails: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
  },
];

const mockAttributes: Attribute[] = [
  {
    id: 'attr-contains',
    sourceNodeId: 'context-1',
    targetNodeId: 'regular-1',
    attributeType: 'contains',
    attributeName: 'contains',
    attributeKey: 'hierarchy',
    attributeValue: null,
    metadata: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'attr-ref-1',
    sourceNodeId: 'regular-1',
    targetNodeId: 'regular-2',
    attributeType: 'references',
    attributeName: 'references',
    attributeKey: 'wiki-link',
    attributeValue: null,
    metadata: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'attr-ref-2',
    sourceNodeId: 'regular-2',
    targetNodeId: 'regular-1',
    attributeType: 'references',
    attributeName: 'references',
    attributeKey: 'wiki-link',
    attributeValue: null,
    metadata: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

function makeMockGraphData(viewMode = mockGraphState.viewMode, selectedNodeId: string | null = null) {
  const allNodes = [
    {
      id: 'context-1',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        label: 'Projects Folder',
        node: mockNodes[0],
      },
      selected: selectedNodeId === 'context-1',
    },
    {
      id: 'regular-1',
      type: 'custom',
      position: { x: 150, y: 100 },
      data: {
        label: 'Page A',
        node: mockNodes[1],
      },
      selected: selectedNodeId === 'regular-1',
    },
    {
      id: 'regular-2',
      type: 'custom',
      position: { x: 350, y: 100 },
      data: {
        label: 'Page B',
        node: mockNodes[2],
      },
      selected: selectedNodeId === 'regular-2',
    },
  ];

  const allEdges = [
    {
      id: 'attr-contains',
      source: 'context-1',
      target: 'regular-1',
      type: 'default',
      animated: false,
      style: { strokeWidth: 1 },
      data: {
        label: 'contains',
        isBidirectional: false,
        tooltip: 'contains',
      },
    },
    {
      id: 'attr-ref-1',
      source: 'regular-1',
      target: 'regular-2',
      type: 'bidirectional',
      animated: false,
      className: 'edge-bidirectional',
      style: { strokeWidth: 2 },
      data: {
        label: 'references',
        isBidirectional: true,
        tooltip: 'bidirectional relationship',
      },
    },
    {
      id: 'attr-ref-2',
      source: 'regular-2',
      target: 'regular-1',
      type: 'bidirectional',
      animated: false,
      className: 'edge-bidirectional',
      style: { strokeWidth: 2 },
      data: {
        label: 'references',
        isBidirectional: true,
        tooltip: 'bidirectional relationship',
      },
    },
  ];

  const visibleNodes = allNodes.filter((node) => {
    if (node.data.node.nodeType === 'CONTEXT') return viewMode.showContext;
    return viewMode.showRegular;
  });

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

  const visibleEdges = allEdges.filter((edge) => {
    if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) return false;
    if (edge.id === 'attr-contains' && !viewMode.showContains) return false;
    if (edge.id !== 'attr-contains' && !viewMode.showReferences) return false;
    return true;
  });

  return {
    nodes: visibleNodes,
    edges: visibleEdges,
  };
}

const renderGraphVisualization = (props?: Partial<React.ComponentProps<typeof GraphVisualization>>) =>
  render(
    <GraphVisualization
      nodes={mockNodes}
      attributes={mockAttributes}
      {...props}
    />
  );

describe('Graph Visualization Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useTheme.mockReturnValue({
      resolvedTheme: 'light',
    });

    mockGraphState = {
      viewMode: {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      },
      selectedNodeId: null,
      setSelectedNode,
    };

    useGraphStore.mockImplementation((selector?: any) => {
      return typeof selector === 'function' ? selector(mockGraphState) : mockGraphState;
    });

    useGraphStore.setState = setGraphStoreState;

    buildGraphData.mockImplementation(
      (_nodes: Node[], _attributes: Attribute[], viewMode: any, selectedNodeId: string | null) =>
        makeMockGraphData(viewMode, selectedNodeId)
    );
  });

  describe('T046: GraphVisualization renders nodes and edges', () => {
    it('should render all nodes when all filters enabled', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-context-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-2')).toBeInTheDocument();
    });

    it('should render nodes using custom reactflow node type', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-node-context-1')).toHaveAttribute('data-node-type', 'custom');
      expect(screen.getByTestId('graph-node-regular-1')).toHaveAttribute('data-node-type', 'custom');
    });

    it('should expose backend node kind in node data', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-node-context-1')).toHaveAttribute('data-node-kind', 'CONTEXT');
      expect(screen.getByTestId('graph-node-regular-1')).toHaveAttribute('data-node-kind', 'REGULAR');
    });

    it('should display node labels with titles', () => {
      renderGraphVisualization();

      expect(screen.getByText('Projects Folder')).toBeInTheDocument();
      expect(screen.getByText('Page A')).toBeInTheDocument();
      expect(screen.getByText('Page B')).toBeInTheDocument();
    });

    it('should render all edges', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-contains')).toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-2')).toBeInTheDocument();
    });

    it('should render minimap for navigation', () => {
      renderGraphVisualization();
      expect(screen.getByTestId('minimap')).toBeInTheDocument();
    });

    it('should render pan/zoom controls', () => {
      renderGraphVisualization();
      expect(screen.getByTestId('controls')).toBeInTheDocument();
    });

    it('should render background pattern', () => {
      renderGraphVisualization();
      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('should render empty state when nodes prop is empty', () => {
      render(
        <GraphVisualization
          nodes={[]}
          attributes={[]}
        />
      );

      expect(screen.getByText(/no nodes to display in graph/i)).toBeInTheDocument();
      expect(screen.queryByTestId('react-flow')).not.toBeInTheDocument();
    });

    it('should select node on single click', () => {
      renderGraphVisualization();

      fireEvent.click(screen.getByTestId('graph-node-regular-1'));

      expect(setSelectedNode).toHaveBeenCalledWith('regular-1');
    });

    it('should call onNodeClick callback on single click', () => {
      const onNodeClick = jest.fn();

      renderGraphVisualization({ onNodeClick });

      fireEvent.click(screen.getByTestId('graph-node-regular-2'));

      expect(onNodeClick).toHaveBeenCalledWith('regular-2');
    });
  });

  describe('T047: GraphControls toggle filters update graph', () => {
    it('should render graph controls container', () => {
      renderGraphVisualization();
      expect(screen.getByTestId('graph-controls')).toBeInTheDocument();
    });

    it('should pass current view mode to GraphControls', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-controls-state')).toHaveTextContent('"showContext":true');
      expect(screen.getByTestId('graph-controls-state')).toHaveTextContent('"showRegular":true');
      expect(screen.getByTestId('graph-controls-state')).toHaveTextContent('"showContains":true');
      expect(screen.getByTestId('graph-controls-state')).toHaveTextContent('"showReferences":true');
    });

    it('should update graph store when GraphControls changes context visibility', () => {
      renderGraphVisualization();

      fireEvent.click(screen.getByTestId('toggle-context'));

      expect(setGraphStoreState).toHaveBeenCalledTimes(1);

      const updater = setGraphStoreState.mock.calls[0][0];
      const result = updater({
        viewMode: {
          showContext: true,
          showRegular: true,
          showContains: true,
          showReferences: true,
        },
      });

      expect(result).toEqual({
        viewMode: {
          showContext: false,
          showRegular: true,
          showContains: true,
          showReferences: true,
        },
      });
    });

    it('should filter out CONTEXT nodes when showContext is false', () => {
      mockGraphState.viewMode = {
        showContext: false,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      renderGraphVisualization();

      expect(screen.queryByTestId('graph-node-context-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-1')).toBeInTheDocument();
    });

    it('should filter out REGULAR nodes when showRegular is false', () => {
      mockGraphState.viewMode = {
        showContext: true,
        showRegular: false,
        showContains: true,
        showReferences: true,
      };

      renderGraphVisualization();

      expect(screen.getByTestId('graph-node-context-1')).toBeInTheDocument();
      expect(screen.queryByTestId('graph-node-regular-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('graph-node-regular-2')).not.toBeInTheDocument();
    });

    it('should filter out contains edges when showContains is false', () => {
      mockGraphState.viewMode = {
        showContext: true,
        showRegular: true,
        showContains: false,
        showReferences: true,
      };

      renderGraphVisualization();

      expect(screen.queryByTestId('graph-edge-attr-contains')).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-1')).toBeInTheDocument();
    });

    it('should filter out references edges when showReferences is false', () => {
      mockGraphState.viewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: false,
      };

      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-contains')).toBeInTheDocument();
      expect(screen.queryByTestId('graph-edge-attr-ref-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('graph-edge-attr-ref-2')).not.toBeInTheDocument();
    });

    it('should update graph when multiple filters changed on rerender', () => {
      const { rerender } = renderGraphVisualization();

      mockGraphState.viewMode = {
        showContext: false,
        showRegular: true,
        showContains: false,
        showReferences: true,
      };

      rerender(
        <GraphVisualization
          nodes={mockNodes}
          attributes={mockAttributes}
        />
      );

      expect(screen.queryByTestId('graph-node-context-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('graph-edge-attr-contains')).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-1')).toBeInTheDocument();
    });

    it('should show empty graph canvas when all node filters disabled', () => {
      mockGraphState.viewMode = {
        showContext: false,
        showRegular: false,
        showContains: true,
        showReferences: true,
      };

      renderGraphVisualization();

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.queryByTestId(/graph-node-/)).not.toBeInTheDocument();
    });
  });

  describe('T048: BidirectionalEdge displays double-headed arrow', () => {
    it('should mark bidirectional edges correctly', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-ref-1')).toHaveAttribute('data-bidirectional', 'true');
      expect(screen.getByTestId('graph-edge-attr-ref-2')).toHaveAttribute('data-bidirectional', 'true');
    });

    it('should not mark unidirectional edges as bidirectional', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-contains')).toHaveAttribute('data-bidirectional', 'false');
    });

    it('should use different edge type for bidirectional edges', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-ref-1')).toHaveAttribute('data-edge-type', 'bidirectional');
    });

    it('should render bidirectional edges with special styling class', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-ref-1')).toHaveClass('edge-bidirectional');
    });

    it('should include double-headed arrow marker definition in svg', () => {
      renderGraphVisualization();

      expect(
        screen.getByTestId('react-flow-edges').querySelector('defs marker#arrowhead-both')
      ).toBeInTheDocument();
    });

    it('should handle mixed bidirectional and unidirectional edges', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-ref-1')).toHaveAttribute('data-bidirectional', 'true');
      expect(screen.getByTestId('graph-edge-attr-contains')).toHaveAttribute('data-bidirectional', 'false');
    });

    it('should apply thicker stroke for bidirectional edges', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-path-attr-ref-1')).toHaveStyle({ strokeWidth: '2' });
    });

    it('should expose bidirectional tooltip text', () => {
      renderGraphVisualization();

      expect(screen.getByTestId('graph-edge-attr-ref-1')).toHaveTextContent('bidirectional relationship');
    });
  });
});