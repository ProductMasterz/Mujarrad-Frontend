import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { GraphControls } from '@/components/graph/GraphControls';
import { useNavigationStore } from '@/stores/navigationStore';
import type { Node, Attribute } from '@/types/entities';
import type { GraphViewMode } from '@/types/graph';

// Mock React Flow
jest.mock('reactflow', () => ({
  ReactFlow: ({ nodes, edges, onNodeClick, onNodeDoubleClick }: any) => (
    <div data-testid="react-flow">
      {nodes.map((node: any) => (
        <div
          key={node.id}
          data-testid={`graph-node-${node.id}`}
          data-node-type={node.type}
          onClick={() => onNodeClick?.({ id: node.id })}
          onDoubleClick={() => onNodeDoubleClick?.({ id: node.id })}
        >
          {node.data.label}
        </div>
      ))}
      {edges.map((edge: any) => (
        <div
          key={edge.id}
          data-testid={`graph-edge-${edge.id}`}
          data-edge-type={edge.type}
          data-bidirectional={edge.data.isBidirectional}
        />
      ))}
    </div>
  ),
  MiniMap: () => <div data-testid="minimap" />,
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  useNodesState: (initialNodes: any) => [initialNodes, jest.fn()],
  useEdgesState: (initialEdges: any) => [initialEdges, jest.fn()],
}));

// Mock navigation store
jest.mock('@/stores/navigationStore');

const mockUseNavigationStore = useNavigationStore as jest.MockedFunction<typeof useNavigationStore>;

describe('Graph Visualization Integration Tests', () => {
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
      attributeKey: 'wiki-link',
      attributeValue: null,
      metadata: {},
      createdBy: 'user-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    mockUseNavigationStore.mockReturnValue({
      graphViewMode: {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      },
      toggleGraphViewMode: jest.fn(),
      setSelectedNode: jest.fn(),
    } as any);
  });

  describe('T046: GraphVisualization renders nodes and edges', () => {
    it('should render all nodes when all filters enabled', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-context-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-2')).toBeInTheDocument();
    });

    it('should render CONTEXT nodes with context type', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const contextNode = screen.getByTestId('graph-node-context-1');
      expect(contextNode).toHaveAttribute('data-node-type', 'context');
    });

    it('should render REGULAR nodes with regular type', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const regularNode = screen.getByTestId('graph-node-regular-1');
      expect(regularNode).toHaveAttribute('data-node-type', 'regular');
    });

    it('should display node labels with titles', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByText('Projects Folder')).toBeInTheDocument();
      expect(screen.getByText('Page A')).toBeInTheDocument();
      expect(screen.getByText('Page B')).toBeInTheDocument();
    });

    it('should render all edges', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('graph-edge-attr-contains')).toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-2')).toBeInTheDocument();
    });

    it('should render minimap for navigation', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('minimap')).toBeInTheDocument();
    });

    it('should render pan/zoom controls', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('controls')).toBeInTheDocument();
    });

    it('should render background pattern', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('should handle empty nodes array', () => {
      render(<GraphVisualization nodes={[]} attributes={[]} />);

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.queryByTestId(/graph-node-/)).not.toBeInTheDocument();
    });

    it('should select node on single click', () => {
      const setSelectedMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: true,
          showRegular: true,
          showContains: true,
          showReferences: true,
        },
        toggleGraphViewMode: jest.fn(),
        setSelectedNode: setSelectedMock,
      } as any);

      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const node = screen.getByTestId('graph-node-regular-1');
      fireEvent.click(node);

      expect(setSelectedMock).toHaveBeenCalledWith('regular-1');
    });

    it('should navigate to node on double-click', () => {
      const pushMock = jest.fn();
      // Mock useRouter
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: pushMock,
      });

      render(
        <GraphVisualization
          nodes={mockNodes}
          attributes={mockAttributes}
          spaceSlug="test-ws"
        />
      );

      const node = screen.getByTestId('graph-node-regular-1');
      fireEvent.doubleClick(node);

      expect(pushMock).toHaveBeenCalledWith('/space/test-ws/node/regular-1');
    });
  });

  describe('T047: GraphControls toggle filters update graph', () => {
    it('should render all view mode toggles', () => {
      render(<GraphControls />);

      expect(screen.getByLabelText(/show context nodes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/show regular nodes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/show hierarchy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/show references/i)).toBeInTheDocument();
    });

    it('should show all toggles as checked initially', () => {
      render(<GraphControls />);

      expect(screen.getByLabelText(/show context nodes/i)).toBeChecked();
      expect(screen.getByLabelText(/show regular nodes/i)).toBeChecked();
      expect(screen.getByLabelText(/show hierarchy/i)).toBeChecked();
      expect(screen.getByLabelText(/show references/i)).toBeChecked();
    });

    it('should call toggleGraphViewMode when toggle clicked', () => {
      const toggleMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: true,
          showRegular: true,
          showContains: true,
          showReferences: true,
        },
        toggleGraphViewMode: toggleMock,
      } as any);

      render(<GraphControls />);

      const contextToggle = screen.getByLabelText(/show context nodes/i);
      fireEvent.click(contextToggle);

      expect(toggleMock).toHaveBeenCalledWith('showContext');
    });

    it('should filter out CONTEXT nodes when showContext is false', () => {
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: false,
          showRegular: true,
          showContains: true,
          showReferences: true,
        },
        toggleGraphViewMode: jest.fn(),
      } as any);

      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.queryByTestId('graph-node-context-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-2')).toBeInTheDocument();
    });

    it('should filter out REGULAR nodes when showRegular is false', () => {
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: true,
          showRegular: false,
          showContains: true,
          showReferences: true,
        },
        toggleGraphViewMode: jest.fn(),
      } as any);

      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('graph-node-context-1')).toBeInTheDocument();
      expect(screen.queryByTestId('graph-node-regular-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('graph-node-regular-2')).not.toBeInTheDocument();
    });

    it('should filter out contains edges when showContains is false', () => {
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: true,
          showRegular: true,
          showContains: false,
          showReferences: true,
        },
        toggleGraphViewMode: jest.fn(),
      } as any);

      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.queryByTestId('graph-edge-attr-contains')).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-1')).toBeInTheDocument();
      expect(screen.getByTestId('graph-edge-attr-ref-2')).toBeInTheDocument();
    });

    it('should filter out references edges when showReferences is false', () => {
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: true,
          showRegular: true,
          showContains: true,
          showReferences: false,
        },
        toggleGraphViewMode: jest.fn(),
      } as any);

      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.getByTestId('graph-edge-attr-contains')).toBeInTheDocument();
      expect(screen.queryByTestId('graph-edge-attr-ref-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('graph-edge-attr-ref-2')).not.toBeInTheDocument();
    });

    it('should update graph when multiple filters changed', () => {
      const { rerender } = render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: false,
          showRegular: true,
          showContains: false,
          showReferences: true,
        },
        toggleGraphViewMode: jest.fn(),
      } as any);

      rerender(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.queryByTestId('graph-node-context-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('graph-edge-attr-contains')).not.toBeInTheDocument();
      expect(screen.getByTestId('graph-node-regular-1')).toBeInTheDocument();
    });

    it('should show empty state when all node filters disabled', () => {
      mockUseNavigationStore.mockReturnValue({
        graphViewMode: {
          showContext: false,
          showRegular: false,
          showContains: true,
          showReferences: true,
        },
        toggleGraphViewMode: jest.fn(),
      } as any);

      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      expect(screen.queryByTestId(/graph-node-/)).not.toBeInTheDocument();
      expect(screen.getByText(/no nodes to display/i)).toBeInTheDocument();
    });
  });

  describe('T048: BidirectionalEdge displays double-headed arrow', () => {
    it('should mark bidirectional edges correctly', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      // attr-ref-1 and attr-ref-2 form a bidirectional pair
      const edge1 = screen.getByTestId('graph-edge-attr-ref-1');
      const edge2 = screen.getByTestId('graph-edge-attr-ref-2');

      expect(edge1).toHaveAttribute('data-bidirectional', 'true');
      expect(edge2).toHaveAttribute('data-bidirectional', 'true');
    });

    it('should not mark unidirectional edges as bidirectional', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      // attr-contains is unidirectional
      const containsEdge = screen.getByTestId('graph-edge-attr-contains');
      expect(containsEdge).toHaveAttribute('data-bidirectional', 'false');
    });

    it('should use different edge type for bidirectional edges', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const bidiEdge = screen.getByTestId('graph-edge-attr-ref-1');
      expect(bidiEdge).toHaveAttribute('data-edge-type', 'bidirectional');
    });

    it('should render bidirectional edges with special styling', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const bidiEdge = screen.getByTestId('graph-edge-attr-ref-1');
      expect(bidiEdge).toHaveClass('edge-bidirectional');
    });

    it('should show double-headed arrow marker on bidirectional edges', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const bidiEdge = screen.getByTestId('graph-edge-attr-ref-1');
      const svg = bidiEdge.closest('svg');

      // Check for marker definition
      expect(svg?.querySelector('defs marker#arrowhead-both')).toBeInTheDocument();
    });

    it('should handle mixed bidirectional and unidirectional edges', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const bidiEdge = screen.getByTestId('graph-edge-attr-ref-1');
      const uniEdge = screen.getByTestId('graph-edge-attr-contains');

      expect(bidiEdge).toHaveAttribute('data-bidirectional', 'true');
      expect(uniEdge).toHaveAttribute('data-bidirectional', 'false');
    });

    it('should apply thicker stroke for bidirectional edges', () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const bidiEdge = screen.getByTestId('graph-edge-attr-ref-1');
      expect(bidiEdge).toHaveStyle({ strokeWidth: '2' });
    });

    it('should show tooltip indicating bidirectional relationship', async () => {
      render(<GraphVisualization nodes={mockNodes} attributes={mockAttributes} />);

      const bidiEdge = screen.getByTestId('graph-edge-attr-ref-1');
      fireEvent.mouseEnter(bidiEdge);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent(/bidirectional/i);
      });
    });
  });
});
