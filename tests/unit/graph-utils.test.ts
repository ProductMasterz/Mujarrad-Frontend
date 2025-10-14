import { describe, it, expect } from '@jest/globals';
import { detectBidirectionalEdges, buildGraphData } from '@/lib/graph-utils';
import type { Node, Attribute } from '@/types/entities';
import { AttributeKey } from '@/types/backend-dtos';
import type { GraphViewMode } from '@/types/graph';

describe('Graph Utilities Unit Tests', () => {
  describe('T021: detectBidirectionalEdges identifies A↔B pairs', () => {
    it('should detect simple bidirectional edge', () => {
      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-B',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'node-B',
          targetNodeId: 'node-A',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const bidirectional = detectBidirectionalEdges(attributes);

      expect(bidirectional.size).toBe(2);
      expect(bidirectional.has('attr-1')).toBe(true);
      expect(bidirectional.has('attr-2')).toBe(true);
    });

    it('should detect multiple bidirectional pairs', () => {
      const attributes: Attribute[] = [
        // A ↔ B
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-B',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'node-B',
          targetNodeId: 'node-A',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        // C ↔ D
        {
          id: 'attr-3',
          sourceNodeId: 'node-C',
          targetNodeId: 'node-D',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-4',
          sourceNodeId: 'node-D',
          targetNodeId: 'node-C',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const bidirectional = detectBidirectionalEdges(attributes);

      expect(bidirectional.size).toBe(4);
      expect(bidirectional.has('attr-1')).toBe(true);
      expect(bidirectional.has('attr-2')).toBe(true);
      expect(bidirectional.has('attr-3')).toBe(true);
      expect(bidirectional.has('attr-4')).toBe(true);
    });

    it('should not mark unidirectional edges as bidirectional', () => {
      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-B',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'node-B',
          targetNodeId: 'node-C',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const bidirectional = detectBidirectionalEdges(attributes);

      expect(bidirectional.size).toBe(0);
    });

    it('should only mark edges as bidirectional if attributeType matches', () => {
      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-B',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'node-B',
          targetNodeId: 'node-A',
          attributeType: 'depends_on',
          attributeKey: 'dependency',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const bidirectional = detectBidirectionalEdges(attributes);

      // Different types, should not be marked as bidirectional
      expect(bidirectional.size).toBe(0);
    });

    it('should handle empty attributes array', () => {
      const bidirectional = detectBidirectionalEdges([]);

      expect(bidirectional.size).toBe(0);
    });

    it('should handle self-referencing edge', () => {
      const attributes: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-A',
          attributeType: 'references',
          attributeKey: 'self-ref',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const bidirectional = detectBidirectionalEdges(attributes);

      // Self-reference is technically bidirectional
      expect(bidirectional.has('attr-1')).toBe(true);
    });

    it('should handle mixed bidirectional and unidirectional edges', () => {
      const attributes: Attribute[] = [
        // A ↔ B (bidirectional)
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-B',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'node-B',
          targetNodeId: 'node-A',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        // C → D (unidirectional)
        {
          id: 'attr-3',
          sourceNodeId: 'node-C',
          targetNodeId: 'node-D',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const bidirectional = detectBidirectionalEdges(attributes);

      expect(bidirectional.size).toBe(2);
      expect(bidirectional.has('attr-1')).toBe(true);
      expect(bidirectional.has('attr-2')).toBe(true);
      expect(bidirectional.has('attr-3')).toBe(false);
    });
  });

  describe('T022: buildGraphData filters nodes by GraphViewMode', () => {
    const mockNodes: Node[] = [
      {
        id: 'context-1',
        spaceId: 'ws-1',
        title: 'Folder 1',
        slug: 'folder-1',
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
        title: 'Page 1',
        slug: 'page-1',
        nodeType: 'REGULAR',
        markdownContent: '',
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: 'context-2',
        spaceId: 'ws-1',
        title: 'Folder 2',
        slug: 'folder-2',
        nodeType: 'CONTEXT',
        markdownContent: null,
        nodeDetails: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: 'regular-2',
        spaceId: 'ws-1',
        title: 'Page 2',
        slug: 'page-2',
        nodeType: 'REGULAR',
        markdownContent: '',
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
        attributeKey: AttributeKey.CONTAINS,
        attributeValue: null,
        metadata: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'attr-ref',
        sourceNodeId: 'regular-1',
        targetNodeId: 'regular-2',
        attributeKey: AttributeKey.REFERENCES,
        attributeValue: null,
        metadata: {},
        createdBy: 'user-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];

    it('should show all nodes when all filters enabled', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.nodes).toHaveLength(4);
      expect(graphData.edges).toHaveLength(2);
    });

    it('should filter out CONTEXT nodes when showContext is false', () => {
      const viewMode: GraphViewMode = {
        showContext: false,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.nodes).toHaveLength(2);
      expect(graphData.nodes.every(n => n.type === 'regular')).toBe(true);
      const nodeIds = graphData.nodes.map(n => n.id);
      expect(nodeIds).toContain('regular-1');
      expect(nodeIds).toContain('regular-2');
    });

    it('should filter out REGULAR nodes when showRegular is false', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: false,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.nodes).toHaveLength(2);
      expect(graphData.nodes.every(n => n.type === 'context')).toBe(true);
      const nodeIds = graphData.nodes.map(n => n.id);
      expect(nodeIds).toContain('context-1');
      expect(nodeIds).toContain('context-2');
    });

    it('should filter out contains edges when showContains is false', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: false,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.edges).toHaveLength(1);
      expect(graphData.edges[0].data.attribute.attributeKey).toBe('references');
    });

    it('should filter out references edges when showReferences is false', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: false,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.edges).toHaveLength(1);
      expect(graphData.edges[0].data.attribute.attributeKey).toBe('contains');
    });

    it('should return empty graph when all node filters disabled', () => {
      const viewMode: GraphViewMode = {
        showContext: false,
        showRegular: false,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.nodes).toHaveLength(0);
    });

    it('should return no edges when all edge filters disabled', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: false,
        showReferences: false,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.edges).toHaveLength(0);
    });

    it('should set correct node types for graph rendering', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      const contextNode = graphData.nodes.find(n => n.id === 'context-1');
      expect(contextNode?.type).toBe('context');

      const regularNode = graphData.nodes.find(n => n.id === 'regular-1');
      expect(regularNode?.type).toBe('regular');
    });

    it('should include node data with label', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(mockNodes, mockAttributes, viewMode);

      expect(graphData.nodes[0].data).toHaveProperty('node');
      expect(graphData.nodes[0].data).toHaveProperty('label');
      expect(graphData.nodes[0].data.label).toBe(graphData.nodes[0].data.node.title);
    });

    it('should mark bidirectional edges correctly', () => {
      const nodesWithBidi: Node[] = [
        {
          id: 'node-A',
          spaceId: 'ws-1',
          title: 'Node A',
          slug: 'node-a',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
        {
          id: 'node-B',
          spaceId: 'ws-1',
          title: 'Node B',
          slug: 'node-b',
          nodeType: 'REGULAR',
          markdownContent: '',
          nodeDetails: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          version: 1,
        },
      ];

      const attributesWithBidi: Attribute[] = [
        {
          id: 'attr-1',
          sourceNodeId: 'node-A',
          targetNodeId: 'node-B',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'attr-2',
          sourceNodeId: 'node-B',
          targetNodeId: 'node-A',
          attributeType: 'references',
          attributeKey: 'wiki-link',
          attributeValue: null,
          metadata: {},
          createdBy: 'user-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData(nodesWithBidi, attributesWithBidi, viewMode);

      expect(graphData.edges).toHaveLength(2);
      expect(graphData.edges[0].data.isBidirectional).toBe(true);
      expect(graphData.edges[1].data.isBidirectional).toBe(true);
    });

    it('should handle empty nodes and attributes', () => {
      const viewMode: GraphViewMode = {
        showContext: true,
        showRegular: true,
        showContains: true,
        showReferences: true,
      };

      const graphData = buildGraphData([], [], viewMode);

      expect(graphData.nodes).toHaveLength(0);
      expect(graphData.edges).toHaveLength(0);
    });
  });
});
