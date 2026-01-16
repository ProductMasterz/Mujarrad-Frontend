import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { TreeNode } from '@/components/hierarchy/TreeNode';
import { useNavigationStore } from '@/stores/navigationStore';
import type { TreeNode as TreeNodeType } from '@/types/hierarchy';
import type { Node } from '@/types/entities';

// Mock navigation store
jest.mock('@/stores/navigationStore');

const mockUseNavigationStore = useNavigationStore as jest.MockedFunction<typeof useNavigationStore>;

describe('Hierarchy Navigation Integration Tests', () => {
  const mockTreeData: TreeNodeType[] = [
    {
      node: {
        id: 'context-1',
        spaceId: 'ws-1',
        title: 'Projects',
        slug: 'projects',
        nodeType: 'CONTEXT',
        markdownContent: null,
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      },
      children: [
        {
          node: {
            id: 'regular-1',
            spaceId: 'ws-1',
            title: 'Project A',
            slug: 'project-a',
            nodeType: 'REGULAR',
            markdownContent: 'Content A',
            nodeDetails: {},
            createdBy: 'user-1',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            version: 1,
          },
          children: [],
          level: 1,
          isExpanded: false,
          isSelected: false,
          parentId: 'context-1',
        },
        {
          node: {
            id: 'regular-2',
            spaceId: 'ws-1',
            title: 'Project B',
            slug: 'project-b',
            nodeType: 'REGULAR',
            markdownContent: 'Content B',
            nodeDetails: {},
            createdBy: 'user-1',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            version: 1,
          },
          children: [],
          level: 1,
          isExpanded: false,
          isSelected: false,
          parentId: 'context-1',
        },
      ],
      level: 0,
      isExpanded: false,
      isSelected: false,
      parentId: null,
    },
  ];

  beforeEach(() => {
    mockUseNavigationStore.mockReturnValue({
      selectedNodeId: null,
      expandedNodeIds: new Set(),
      toggleNodeExpanded: jest.fn(),
      setSelectedNode: jest.fn(),
    } as any);
  });

  describe('T039: HierarchyNavigator renders tree structure', () => {
    it('should render root nodes', () => {
      render(<HierarchyNavigator treeData={mockTreeData} />);

      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should display folder icon for CONTEXT nodes', () => {
      render(<HierarchyNavigator treeData={mockTreeData} />);

      const contextNode = screen.getByText('Projects').closest('[role="treeitem"]');
      expect(contextNode).toHaveAttribute('data-node-type', 'CONTEXT');
      // Icon should be folder (📁 or SVG with appropriate test ID)
      expect(contextNode?.querySelector('[data-testid="folder-icon"]')).toBeInTheDocument();
    });

    it('should display document icon for REGULAR nodes when expanded', () => {
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const regularNode = screen.getByText('Project A').closest('[role="treeitem"]');
      expect(regularNode).toHaveAttribute('data-node-type', 'REGULAR');
      expect(regularNode?.querySelector('[data-testid="document-icon"]')).toBeInTheDocument();
    });

    it('should render nested structure correctly', () => {
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    it('should apply correct indentation for tree levels', () => {
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]');
      const childNode = screen.getByText('Project A').closest('[role="treeitem"]');

      // Level 0 should have less indentation than level 1
      const rootIndent = window.getComputedStyle(rootNode!).paddingLeft;
      const childIndent = window.getComputedStyle(childNode!).paddingLeft;

      expect(parseInt(childIndent)).toBeGreaterThan(parseInt(rootIndent));
    });

    it('should render empty state when no tree data', () => {
      render(<HierarchyNavigator treeData={[]} />);

      expect(screen.getByText(/no pages/i)).toBeInTheDocument();
    });
  });

  describe('T040: TreeNode expand/collapse toggles children', () => {
    it('should show expand button for CONTEXT nodes', () => {
      render(<HierarchyNavigator treeData={mockTreeData} />);

      const expandButton = screen.getByRole('button', { name: /expand/i });
      expect(expandButton).toBeInTheDocument();
    });

    it('should not show expand button for leaf nodes', () => {
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      // Project A is a leaf node
      const leafNode = screen.getByText('Project A').closest('[role="treeitem"]');
      expect(leafNode?.querySelector('button[aria-label*="expand"]')).not.toBeInTheDocument();
    });

    it('should toggle children visibility on expand button click', async () => {
      const toggleMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(),
        toggleNodeExpanded: toggleMock,
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      // Children should not be visible initially
      expect(screen.queryByText('Project A')).not.toBeInTheDocument();

      // Click expand
      const expandButton = screen.getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);

      expect(toggleMock).toHaveBeenCalledWith('context-1');
    });

    it('should change expand icon when expanded', () => {
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      expect(collapseButton).toBeInTheDocument();
    });

    it('should collapse children when collapse button clicked', async () => {
      const toggleMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: toggleMock,
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      // Children should be visible
      expect(screen.getByText('Project A')).toBeInTheDocument();

      // Click collapse
      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      fireEvent.click(collapseButton);

      expect(toggleMock).toHaveBeenCalledWith('context-1');
    });

    it('should maintain expand state after re-render', () => {
      const { rerender } = render(<HierarchyNavigator treeData={mockTreeData} />);

      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      rerender(<HierarchyNavigator treeData={mockTreeData} />);

      expect(screen.getByText('Project A')).toBeInTheDocument();
    });
  });

  describe('T041: TreeNode selection updates store', () => {
    it('should call setSelectedNode when node clicked', () => {
      const setSelectedMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: setSelectedMock,
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const nodeElement = screen.getByText('Project A');
      fireEvent.click(nodeElement);

      expect(setSelectedMock).toHaveBeenCalledWith('regular-1');
    });

    it('should highlight selected node', () => {
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: 'regular-1',
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const selectedNode = screen.getByText('Project A').closest('[role="treeitem"]');
      expect(selectedNode).toHaveClass('selected');
      expect(selectedNode).toHaveAttribute('aria-selected', 'true');
    });

    it('should remove highlight from previously selected node', () => {
      const { rerender } = render(<HierarchyNavigator treeData={mockTreeData} />);

      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: 'regular-1',
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      rerender(<HierarchyNavigator treeData={mockTreeData} />);

      let selectedNode = screen.getByText('Project A').closest('[role="treeitem"]');
      expect(selectedNode).toHaveAttribute('aria-selected', 'true');

      // Change selection
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: 'regular-2',
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      rerender(<HierarchyNavigator treeData={mockTreeData} />);

      const previouslySelected = screen.getByText('Project A').closest('[role="treeitem"]');
      expect(previouslySelected).toHaveAttribute('aria-selected', 'false');

      const newSelected = screen.getByText('Project B').closest('[role="treeitem"]');
      expect(newSelected).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('T042: TreeNode keyboard navigation (arrows, Enter)', () => {
    it('should navigate down with ArrowDown key', async () => {
      const user = userEvent.setup();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const firstNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      firstNode.focus();

      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).toBe(
        screen.getByText('Project A').closest('[role="treeitem"]')
      );
    });

    it('should navigate up with ArrowUp key', async () => {
      const user = userEvent.setup();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const secondNode = screen.getByText('Project A').closest('[role="treeitem"]') as HTMLElement;
      secondNode.focus();

      await user.keyboard('{ArrowUp}');

      expect(document.activeElement).toBe(
        screen.getByText('Projects').closest('[role="treeitem"]')
      );
    });

    it('should expand node with ArrowRight key', async () => {
      const user = userEvent.setup();
      const toggleMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(),
        toggleNodeExpanded: toggleMock,
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const contextNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      contextNode.focus();

      await user.keyboard('{ArrowRight}');

      expect(toggleMock).toHaveBeenCalledWith('context-1');
    });

    it('should collapse node with ArrowLeft key', async () => {
      const user = userEvent.setup();
      const toggleMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: toggleMock,
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const contextNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      contextNode.focus();

      await user.keyboard('{ArrowLeft}');

      expect(toggleMock).toHaveBeenCalledWith('context-1');
    });

    it('should select node with Enter key', async () => {
      const user = userEvent.setup();
      const setSelectedMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: setSelectedMock,
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const node = screen.getByText('Project A').closest('[role="treeitem"]') as HTMLElement;
      node.focus();

      await user.keyboard('{Enter}');

      expect(setSelectedMock).toHaveBeenCalledWith('regular-1');
    });

    it('should select node with Space key', async () => {
      const user = userEvent.setup();
      const setSelectedMock = jest.fn();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: setSelectedMock,
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const node = screen.getByText('Project A').closest('[role="treeitem"]') as HTMLElement;
      node.focus();

      await user.keyboard(' ');

      expect(setSelectedMock).toHaveBeenCalledWith('regular-1');
    });

    it('should not navigate beyond first node with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<HierarchyNavigator treeData={mockTreeData} />);

      const firstNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      firstNode.focus();

      await user.keyboard('{ArrowUp}');

      // Should still be on first node
      expect(document.activeElement).toBe(firstNode);
    });

    it('should not navigate beyond last visible node with ArrowDown', async () => {
      const user = userEvent.setup();
      mockUseNavigationStore.mockReturnValue({
        selectedNodeId: null,
        expandedNodeIds: new Set(['context-1']),
        toggleNodeExpanded: jest.fn(),
        setSelectedNode: jest.fn(),
      } as any);

      render(<HierarchyNavigator treeData={mockTreeData} />);

      const lastNode = screen.getByText('Project B').closest('[role="treeitem"]') as HTMLElement;
      lastNode.focus();

      await user.keyboard('{ArrowDown}');

      // Should still be on last node
      expect(document.activeElement).toBe(lastNode);
    });
  });
});
