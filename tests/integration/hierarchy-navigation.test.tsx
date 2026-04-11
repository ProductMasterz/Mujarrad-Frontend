import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/stores/hierarchyStore', () => ({
  useHierarchyStore: jest.fn(),
}));

jest.mock('@/hooks/useHierarchyTree', () => ({
  useHierarchyTree: jest.fn(),
}));

jest.mock('@/components/hierarchy/TreeNodeContextMenu', () => ({
  TreeNodeContextMenu: () => null,
  __esModule: true,
  default: () => null,
}));

const { useHierarchyStore } = require('@/stores/hierarchyStore') as {
  useHierarchyStore: jest.Mock;
};

const { useHierarchyTree } = require('@/hooks/useHierarchyTree') as {
  useHierarchyTree: jest.Mock;
};

const { HierarchyNavigator } = require('@/components/hierarchy/HierarchyNavigator') as {
  HierarchyNavigator: React.ComponentType<any>;
};

const toggleExpanded = jest.fn();
const setSelectedNode = jest.fn();

let mockHierarchyState: any;

const mockNodes = [
  {
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
  {
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
  {
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
];

const mockAttributes = [
  {
    id: 'attr-1',
    sourceNodeId: 'context-1',
    targetNodeId: 'regular-1',
    attributeType: 'contains',
    attributeName: 'contains',
    attributeKey: 'contains',
    attributeValue: null,
    metadata: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'attr-2',
    sourceNodeId: 'context-1',
    targetNodeId: 'regular-2',
    attributeType: 'contains',
    attributeName: 'contains',
    attributeKey: 'contains',
    attributeValue: null,
    metadata: {},
    createdBy: 'user-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const buildMockHierarchyTree = ({
  expanded = false,
  selectedNodeId = null,
}: {
  expanded?: boolean;
  selectedNodeId?: string | null;
} = {}) => {
  const projectA = {
    node: mockNodes[1],
    children: [],
    level: 1,
    isExpanded: false,
    isSelected: selectedNodeId === 'regular-1',
    parentId: 'context-1',
  };

  const projectB = {
    node: mockNodes[2],
    children: [],
    level: 1,
    isExpanded: false,
    isSelected: selectedNodeId === 'regular-2',
    parentId: 'context-1',
  };

  const projects = {
    node: mockNodes[0],
    children: [projectA, projectB],
    level: 0,
    isExpanded: expanded,
    isSelected: selectedNodeId === 'context-1',
    parentId: null,
  };

  return {
    rootNodes: [projects],
    nodeMap: new Map<string, any>([
      ['context-1', projects],
      ['regular-1', projectA],
      ['regular-2', projectB],
    ]),
  };
};

const renderHierarchyNavigator = () =>
  render(
    <HierarchyNavigator
      nodes={mockNodes}
      attributes={mockAttributes}
    />
  );

describe('Hierarchy Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockHierarchyState = {
      expandedNodeIds: [],
      selectedNodeId: null,
      toggleExpanded,
      setSelectedNode,
    };

    useHierarchyStore.mockImplementation((selector?: any) => {
      return typeof selector === 'function'
        ? selector(mockHierarchyState)
        : mockHierarchyState;
    });

    useHierarchyTree.mockReturnValue(
      buildMockHierarchyTree({
        expanded: false,
        selectedNodeId: null,
      })
    );
  });

  describe('HierarchyNavigator renders tree structure', () => {
    it('should render root node', () => {
      renderHierarchyNavigator();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should render collapsed root state', () => {
      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]');
      expect(rootNode).toHaveAttribute('aria-expanded', 'false');
    });

    it('should render child nodes when expanded', () => {
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    it('should apply greater indentation to child nodes', () => {
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]');
      const childNode = screen.getByText('Project A').closest('[role="treeitem"]');

      const rootIndent = window.getComputedStyle(rootNode!).paddingLeft;
      const childIndent = window.getComputedStyle(childNode!).paddingLeft;

      expect(parseInt(childIndent, 10)).toBeGreaterThan(parseInt(rootIndent, 10));
    });

    it('should render empty state when there is no hierarchy', () => {
      useHierarchyTree.mockReturnValue({
        rootNodes: [],
        nodeMap: new Map(),
      });

      render(<HierarchyNavigator nodes={[]} attributes={[]} />);

      expect(screen.getByText(/no pages in hierarchy/i)).toBeInTheDocument();
    });
  });

  describe('TreeNode expand/collapse', () => {
    it('should render toggle button for root node', () => {
      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]')!;
      const toggleButton = rootNode.querySelector('button');

      expect(toggleButton).toBeInTheDocument();
    });

    it('should call toggleExpanded when root toggle is clicked', () => {
      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]')!;
      const toggleButton = rootNode.querySelector('button') as HTMLButtonElement;

      fireEvent.click(toggleButton);

      expect(toggleExpanded).toHaveBeenCalledTimes(1);
      expect(toggleExpanded).toHaveBeenCalledWith('context-1');
    });

    it('should reflect expanded state when expanded', () => {
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]');
      expect(rootNode).toHaveAttribute('aria-expanded', 'true');
    });

    it('should keep rendering children after rerender when expanded tree is returned', () => {
      const { rerender } = renderHierarchyNavigator();

      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      rerender(
        <HierarchyNavigator
          nodes={mockNodes}
          attributes={mockAttributes}
        />
      );

      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });

  describe('TreeNode selection', () => {
    it('should call setSelectedNode when child node clicked', () => {
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      fireEvent.click(screen.getByText('Project A'));

      expect(setSelectedNode).toHaveBeenCalledWith('regular-1');
    });

    it('should mark selected child node', () => {
      useHierarchyTree.mockReturnValue(
        buildMockHierarchyTree({
          expanded: true,
          selectedNodeId: 'regular-1',
        })
      );

      renderHierarchyNavigator();

      const selectedNode = screen.getByText('Project A').closest('[role="treeitem"]');
      expect(selectedNode).toHaveAttribute('aria-selected', 'true');
    });

    it('should update selected state on rerender', () => {
      useHierarchyTree.mockReturnValue(
        buildMockHierarchyTree({
          expanded: true,
          selectedNodeId: 'regular-1',
        })
      );

      const { rerender } = renderHierarchyNavigator();

      expect(
        screen.getByText('Project A').closest('[role="treeitem"]')
      ).toHaveAttribute('aria-selected', 'true');

      useHierarchyTree.mockReturnValue(
        buildMockHierarchyTree({
          expanded: true,
          selectedNodeId: 'regular-2',
        })
      );

      rerender(
        <HierarchyNavigator
          nodes={mockNodes}
          attributes={mockAttributes}
        />
      );

      expect(
        screen.getByText('Project A').closest('[role="treeitem"]')
      ).toHaveAttribute('aria-selected', 'false');

      expect(
        screen.getByText('Project B').closest('[role="treeitem"]')
      ).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('TreeNode keyboard interaction', () => {
    it('should expand root node with ArrowRight', async () => {
      const user = userEvent.setup();

      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      rootNode.focus();

      await user.keyboard('{ArrowRight}');

      expect(toggleExpanded).toHaveBeenCalledWith('context-1');
    });

    it('should collapse expanded root node with ArrowLeft', async () => {
      const user = userEvent.setup();
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      rootNode.focus();

      await user.keyboard('{ArrowLeft}');

      expect(toggleExpanded).toHaveBeenCalledWith('context-1');
    });

    it('should select child node with Enter', async () => {
      const user = userEvent.setup();
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      const childNode = screen.getByText('Project A').closest('[role="treeitem"]') as HTMLElement;
      childNode.focus();

      await user.keyboard('{Enter}');

      expect(setSelectedNode).toHaveBeenCalledWith('regular-1');
    });

    it('should select child node with Space', async () => {
      const user = userEvent.setup();
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      const childNode = screen.getByText('Project A').closest('[role="treeitem"]') as HTMLElement;
      childNode.focus();

      await user.keyboard(' ');

      expect(setSelectedNode).toHaveBeenCalledWith('regular-1');
    });

    it('should not expand leaf node with ArrowRight', async () => {
      const user = userEvent.setup();
      useHierarchyTree.mockReturnValue(buildMockHierarchyTree({ expanded: true }));

      renderHierarchyNavigator();

      const childNode = screen.getByText('Project A').closest('[role="treeitem"]') as HTMLElement;
      childNode.focus();

      await user.keyboard('{ArrowRight}');

      expect(toggleExpanded).not.toHaveBeenCalled();
    });

    it('should not collapse already-collapsed root with ArrowLeft', async () => {
      const user = userEvent.setup();

      renderHierarchyNavigator();

      const rootNode = screen.getByText('Projects').closest('[role="treeitem"]') as HTMLElement;
      rootNode.focus();

      await user.keyboard('{ArrowLeft}');

      expect(toggleExpanded).not.toHaveBeenCalled();
    });
  });
});