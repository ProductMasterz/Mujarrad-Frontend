import { describe, it, expect } from '@jest/globals';
import { buildHierarchyTree } from '@/lib/hierarchy-utils';
import type { Node, Attribute } from '@/types/entities';
import type { HierarchyTree, TreeNode } from '@/types/hierarchy';

describe('Hierarchy Tree Utility Tests', () => {
  describe('T019: buildHierarchyTree constructs tree from nodes + attributes', () => {
    it('should build simple parent-child tree', () => {
      const nodes: Node[] = [
        {
          id: 'parent-1',
          spaceId: 'ws-1',
          title: 'Parent Folder',
          slug: 'parent-folder',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'child-1',
          spaceId: 'ws-1',
          title: 'Child Page',
          slug: 'child-page',
          nodeType: 'REGULAR',
          markdownContent: 'Content',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'parent-1',
          targetNodeId: 'child-1',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      expect(tree.rootNodes).toHaveLength(1);
      expect(tree.rootNodes[0].node.id).toBe('parent-1');
      expect(tree.rootNodes[0].children).toHaveLength(1);
      expect(tree.rootNodes[0].children[0].node.id).toBe('child-1');
      expect(tree.rootNodes[0].children[0].parentId).toBe('parent-1');
    });

    it('should build multi-level tree (3 levels deep)', () => {
      const nodes: Node[] = [
        {
          id: 'root',
          spaceId: 'ws-1',
          title: 'Root',
          slug: 'root',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'level-1',
          spaceId: 'ws-1',
          title: 'Level 1',
          slug: 'level-1',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'level-2',
          spaceId: 'ws-1',
          title: 'Level 2',
          slug: 'level-2',
          nodeType: 'REGULAR',
          markdownContent: 'Content',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'root',
          targetNodeId: 'level-1',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'level-1',
          targetNodeId: 'level-2',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      expect(tree.rootNodes).toHaveLength(1);
      expect(tree.rootNodes[0].level).toBe(0);
      expect(tree.rootNodes[0].children).toHaveLength(1);
      expect(tree.rootNodes[0].children[0].level).toBe(1);
      expect(tree.rootNodes[0].children[0].children).toHaveLength(1);
      expect(tree.rootNodes[0].children[0].children[0].level).toBe(2);
      expect(tree.rootNodes[0].children[0].children[0].node.id).toBe('level-2');
    });

    it('should build tree with multiple children per parent', () => {
      const nodes: Node[] = [
        {
          id: 'parent',
          spaceId: 'ws-1',
          title: 'Parent',
          slug: 'parent',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'child-1',
          spaceId: 'ws-1',
          title: 'Child 1',
          slug: 'child-1',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'child-2',
          spaceId: 'ws-1',
          title: 'Child 2',
          slug: 'child-2',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'child-3',
          spaceId: 'ws-1',
          title: 'Child 3',
          slug: 'child-3',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'parent',
          targetNodeId: 'child-1',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'parent',
          targetNodeId: 'child-2',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-3',
          sourceNodeId: 'parent',
          targetNodeId: 'child-3',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      expect(tree.rootNodes).toHaveLength(1);
      expect(tree.rootNodes[0].children).toHaveLength(3);
      const childIds = tree.rootNodes[0].children.map(c => c.node.id);
      expect(childIds).toContain('child-1');
      expect(childIds).toContain('child-2');
      expect(childIds).toContain('child-3');
    });

    it('should populate nodeMap with all tree nodes', () => {
      const nodes: Node[] = [
        {
          id: 'parent',
          spaceId: 'ws-1',
          title: 'Parent',
          slug: 'parent',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'child',
          spaceId: 'ws-1',
          title: 'Child',
          slug: 'child',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'parent',
          targetNodeId: 'child',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      expect(tree.nodeMap.size).toBe(2);
      expect(tree.nodeMap.has('parent')).toBe(true);
      expect(tree.nodeMap.has('child')).toBe(true);
      expect(tree.nodeMap.get('parent')?.node.id).toBe('parent');
      expect(tree.nodeMap.get('child')?.node.id).toBe('child');
    });

    it('should ignore non-contains relationships', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          spaceId: 'ws-1',
          title: 'Node 1',
          slug: 'node-1',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'node-2',
          spaceId: 'ws-1',
          title: 'Node 2',
          slug: 'node-2',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'node-1',
          targetNodeId: 'node-2',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      // Both nodes should be root nodes since no contains relationship
      expect(tree.rootNodes).toHaveLength(2);
      expect(tree.rootNodes[0].children).toHaveLength(0);
      expect(tree.rootNodes[1].children).toHaveLength(0);
    });

    it('should initialize UI state properties', () => {
      const nodes: Node[] = [
        {
          id: 'node-1',
          spaceId: 'ws-1',
          title: 'Node 1',
          slug: 'node-1',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const tree = buildHierarchyTree(nodes, []);

      expect(tree.rootNodes[0].isExpanded).toBe(false);
      expect(tree.rootNodes[0].isSelected).toBe(false);
    });
  });

  describe('T020: buildHierarchyTree handles root nodes (no parents)', () => {
    it('should identify nodes with no parent as root nodes', () => {
      const nodes: Node[] = [
        {
          id: 'root-1',
          spaceId: 'ws-1',
          title: 'Root 1',
          slug: 'root-1',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'root-2',
          spaceId: 'ws-1',
          title: 'Root 2',
          slug: 'root-2',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const tree = buildHierarchyTree(nodes, []);

      expect(tree.rootNodes).toHaveLength(2);
      expect(tree.rootNodes[0].level).toBe(0);
      expect(tree.rootNodes[1].level).toBe(0);
      expect(tree.rootNodes[0].parentId).toBeNull();
      expect(tree.rootNodes[1].parentId).toBeNull();
    });

    it('should handle mixed root and child nodes', () => {
      const nodes: Node[] = [
        {
          id: 'root-1',
          spaceId: 'ws-1',
          title: 'Root 1',
          slug: 'root-1',
          nodeType: 'CONTEXT',
          markdownContent: null,
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'child-1',
          spaceId: 'ws-1',
          title: 'Child 1',
          slug: 'child-1',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'root-2',
          spaceId: 'ws-1',
          title: 'Root 2',
          slug: 'root-2',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'root-1',
          targetNodeId: 'child-1',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      // root-1 and root-2 should be root nodes
      expect(tree.rootNodes).toHaveLength(2);

      // root-1 should have child-1
      const root1 = tree.rootNodes.find(n => n.node.id === 'root-1');
      expect(root1).toBeDefined();
      expect(root1?.children).toHaveLength(1);
      expect(root1?.children[0].node.id).toBe('child-1');

      // root-2 should have no children
      const root2 = tree.rootNodes.find(n => n.node.id === 'root-2');
      expect(root2).toBeDefined();
      expect(root2?.children).toHaveLength(0);
    });

    it('should handle empty nodes array', () => {
      const tree = buildHierarchyTree([], []);

      expect(tree.rootNodes).toHaveLength(0);
      expect(tree.nodeMap.size).toBe(0);
    });

    it('should handle all nodes having parents (no root nodes)', () => {
      // This is an edge case - circular or orphaned references
      const nodes: Node[] = [
        {
          id: 'node-1',
          spaceId: 'ws-1',
          title: 'Node 1',
          slug: 'node-1',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'nonexistent-parent',
          targetNodeId: 'node-1',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const tree = buildHierarchyTree(nodes, attributes);

      // node-1 is marked as having a parent, but parent doesn't exist
      // It should still appear somewhere accessible
      expect(tree.nodeMap.has('node-1')).toBe(true);
    });

    it('should handle large number of root nodes', () => {
      const nodes: Node[] = Array.from({ length: 50 }, (_, i) => ({
        id: `root-${i}`,
        spaceId: 'ws-1',
        title: `Root ${i}`,
        slug: `root-${i}`,
        nodeType: 'REGULAR' as const,
        markdownContent: '',
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      }));

      const tree = buildHierarchyTree(nodes, []);

      expect(tree.rootNodes).toHaveLength(50);
      expect(tree.nodeMap.size).toBe(50);
    });
  });
});
