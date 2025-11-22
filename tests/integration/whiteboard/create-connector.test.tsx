import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { whiteboardService } from '@/services/whiteboardService';
import { attributeService } from '@/services/attributeService';
import type { ExcalidrawElement } from '@/types/whiteboard';

// Mock Excalidraw with onChange capture
let capturedOnChange: ((elements: ExcalidrawElement[], appState: any) => void) | null = null;

jest.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: ({ onChange }: any) => {
    capturedOnChange = onChange;
    return <div data-testid="excalidraw-mock">Excalidraw Mock</div>;
  },
}));

// Mock services
jest.mock('@/services/whiteboardService', () => ({
  whiteboardService: {
    saveWhiteboardData: jest.fn(),
  },
}));

jest.mock('@/services/attributeService', () => ({
  attributeService: {
    createAttribute: jest.fn(),
    updateAttribute: jest.fn(),
    deleteAttribute: jest.fn(),
  },
}));

const mockSaveWhiteboardData = whiteboardService.saveWhiteboardData as jest.MockedFunction<
  typeof whiteboardService.saveWhiteboardData
>;

const mockCreateAttribute = attributeService.createAttribute as jest.MockedFunction<
  typeof attributeService.createAttribute
>;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('T011: Create Connector Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    mockSaveWhiteboardData.mockReset();
    mockCreateAttribute.mockReset();
    mockSaveWhiteboardData.mockResolvedValue({ success: true });
    mockCreateAttribute.mockResolvedValue({
      id: 'attr-1',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      attributeType: 'connects_to',
      attributeKey: 'whiteboard_connection',
      attributeValue: null,
      metadata: {},
      createdBy: 'user-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
    capturedOnChange = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  describe('Two Shapes with Arrow Connection', () => {
    const createRectangle = (id: string, x: number, y: number) => ({
      id,
      type: 'rectangle' as const,
      x,
      y,
      width: 100,
      height: 50,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'hachure' as const,
      strokeWidth: 1,
      roughness: 1,
      opacity: 100,
      angle: 0,
      seed: 12345,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: [{ id: 'arrow-1', type: 'arrow' }],
      updated: Date.now(),
      link: null,
      locked: false,
    });

    const createArrowWithBindings = (
      startBinding: { elementId: string; focus: number; gap: number },
      endBinding: { elementId: string; focus: number; gap: number }
    ) => ({
      id: 'arrow-1',
      type: 'arrow' as const,
      x: 200,
      y: 100,
      width: 200,
      height: 0,
      points: [
        [0, 0],
        [200, 0],
      ],
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'hachure' as const,
      strokeWidth: 1,
      roughness: 1,
      opacity: 100,
      angle: 0,
      seed: 12345,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      startBinding,
      endBinding,
      startArrowhead: null,
      endArrowhead: 'arrow',
    });

    it('should create two shapes connected by an arrow', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = createRectangle('rect-1', 100, 100);
      const rect2 = createRectangle('rect-2', 400, 100);
      const arrow = createArrowWithBindings(
        { elementId: 'rect-1', focus: 0, gap: 1 },
        { elementId: 'rect-2', focus: 0, gap: 1 }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, arrow], { viewBackgroundColor: '#ffffff' });
        }
      });

      expect(capturedOnChange).toBeDefined();
    });

    it('should detect arrow bindings between shapes', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = createRectangle('rect-1', 100, 100);
      const rect2 = createRectangle('rect-2', 400, 100);
      const arrow = createArrowWithBindings(
        { elementId: 'rect-1', focus: 0, gap: 1 },
        { elementId: 'rect-2', focus: 0, gap: 1 }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, arrow], { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalledWith(
          'space-1',
          'node-1',
          expect.objectContaining({
            elements: expect.arrayContaining([
              expect.objectContaining({
                id: 'arrow-1',
                type: 'arrow',
                startBinding: expect.objectContaining({
                  elementId: 'rect-1',
                }),
                endBinding: expect.objectContaining({
                  elementId: 'rect-2',
                }),
              }),
            ]),
          })
        );
      });
    });

    it('should create attribute with connects_to key when shapes are linked to nodes', async () => {
      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          linkedElements={{
            'rect-1': 'linked-node-1',
            'rect-2': 'linked-node-2',
          }}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = createRectangle('rect-1', 100, 100);
      const rect2 = createRectangle('rect-2', 400, 100);
      const arrow = createArrowWithBindings(
        { elementId: 'rect-1', focus: 0, gap: 1 },
        { elementId: 'rect-2', focus: 0, gap: 1 }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, arrow], { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockCreateAttribute).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceNodeId: 'linked-node-1',
            targetNodeId: 'linked-node-2',
            attributeType: 'connects_to',
            attributeKey: 'whiteboard_connection',
            metadata: expect.objectContaining({
              arrowId: 'arrow-1',
              whiteboardNodeId: 'node-1',
            }),
          })
        );
      });
    });

    it('should not create attribute when shapes are not linked to nodes', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = createRectangle('rect-1', 100, 100);
      const rect2 = createRectangle('rect-2', 400, 100);
      const arrow = createArrowWithBindings(
        { elementId: 'rect-1', focus: 0, gap: 1 },
        { elementId: 'rect-2', focus: 0, gap: 1 }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, arrow], { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalled();
      });

      // Should not create attribute since shapes aren't linked to nodes
      expect(mockCreateAttribute).not.toHaveBeenCalled();
    });

    it('should handle arrow without end binding', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = createRectangle('rect-1', 100, 100);
      const unconnectedArrow = {
        id: 'arrow-1',
        type: 'arrow' as const,
        x: 200,
        y: 100,
        width: 200,
        height: 0,
        points: [
          [0, 0],
          [200, 0],
        ],
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
        endBinding: null,
        startArrowhead: null,
        endArrowhead: 'arrow',
      };

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, unconnectedArrow], { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should save whiteboard data but not create attribute
      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalled();
      });
      expect(mockCreateAttribute).not.toHaveBeenCalled();
    });

    it('should handle bidirectional arrows', async () => {
      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          linkedElements={{
            'rect-1': 'linked-node-1',
            'rect-2': 'linked-node-2',
          }}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = createRectangle('rect-1', 100, 100);
      const rect2 = createRectangle('rect-2', 400, 100);
      const bidirectionalArrow = {
        id: 'arrow-1',
        type: 'arrow' as const,
        x: 200,
        y: 100,
        width: 200,
        height: 0,
        points: [
          [0, 0],
          [200, 0],
        ],
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
        endBinding: { elementId: 'rect-2', focus: 0, gap: 1 },
        startArrowhead: 'arrow',
        endArrowhead: 'arrow',
      };

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, bidirectionalArrow], {
            viewBackgroundColor: '#ffffff',
          });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockCreateAttribute).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              bidirectional: true,
            }),
          })
        );
      });
    });
  });

  describe('Multiple Connections', () => {
    it('should handle multiple arrows from same source', async () => {
      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          linkedElements={{
            'rect-1': 'linked-node-1',
            'rect-2': 'linked-node-2',
            'rect-3': 'linked-node-3',
          }}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const rect1 = {
        id: 'rect-1',
        type: 'rectangle' as const,
        x: 100,
        y: 200,
        width: 100,
        height: 50,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: [
          { id: 'arrow-1', type: 'arrow' },
          { id: 'arrow-2', type: 'arrow' },
        ],
        updated: Date.now(),
        link: null,
        locked: false,
      };

      const rect2 = {
        id: 'rect-2',
        type: 'rectangle' as const,
        x: 400,
        y: 100,
        width: 100,
        height: 50,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: [{ id: 'arrow-1', type: 'arrow' }],
        updated: Date.now(),
        link: null,
        locked: false,
      };

      const rect3 = {
        id: 'rect-3',
        type: 'rectangle' as const,
        x: 400,
        y: 300,
        width: 100,
        height: 50,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: [{ id: 'arrow-2', type: 'arrow' }],
        updated: Date.now(),
        link: null,
        locked: false,
      };

      const arrow1 = {
        id: 'arrow-1',
        type: 'arrow' as const,
        x: 200,
        y: 150,
        width: 200,
        height: 50,
        points: [
          [0, 50],
          [200, 0],
        ],
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
        endBinding: { elementId: 'rect-2', focus: 0, gap: 1 },
        startArrowhead: null,
        endArrowhead: 'arrow',
      };

      const arrow2 = {
        id: 'arrow-2',
        type: 'arrow' as const,
        x: 200,
        y: 250,
        width: 200,
        height: 50,
        points: [
          [0, 0],
          [200, 50],
        ],
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
        endBinding: { elementId: 'rect-3', focus: 0, gap: 1 },
        startArrowhead: null,
        endArrowhead: 'arrow',
      };

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, rect3, arrow1, arrow2], {
            viewBackgroundColor: '#ffffff',
          });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockCreateAttribute).toHaveBeenCalledTimes(2);
      });

      expect(mockCreateAttribute).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceNodeId: 'linked-node-1',
          targetNodeId: 'linked-node-2',
        })
      );

      expect(mockCreateAttribute).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceNodeId: 'linked-node-1',
          targetNodeId: 'linked-node-3',
        })
      );
    });
  });

  describe('Connection Deletion', () => {
    it('should remove attribute when arrow is deleted', async () => {
      const mockDeleteAttribute = attributeService.deleteAttribute as jest.MockedFunction<
        typeof attributeService.deleteAttribute
      >;
      mockDeleteAttribute.mockResolvedValue(undefined);

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          linkedElements={{
            'rect-1': 'linked-node-1',
            'rect-2': 'linked-node-2',
          }}
          existingConnections={{
            'arrow-1': 'attr-1',
          }}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // First, create the arrow
      const rect1 = {
        id: 'rect-1',
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: [],
        updated: Date.now(),
        link: null,
        locked: false,
      };

      const rect2 = {
        id: 'rect-2',
        type: 'rectangle' as const,
        x: 400,
        y: 100,
        width: 100,
        height: 50,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: [],
        updated: Date.now(),
        link: null,
        locked: false,
      };

      // Now the arrow is deleted (isDeleted: true)
      const deletedArrow = {
        id: 'arrow-1',
        type: 'arrow' as const,
        x: 200,
        y: 100,
        width: 200,
        height: 0,
        points: [
          [0, 0],
          [200, 0],
        ],
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure' as const,
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 12345,
        version: 1,
        versionNonce: 1,
        isDeleted: true,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
        endBinding: { elementId: 'rect-2', focus: 0, gap: 1 },
        startArrowhead: null,
        endArrowhead: 'arrow',
      };

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rect1, rect2, deletedArrow], {
            viewBackgroundColor: '#ffffff',
          });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockDeleteAttribute).toHaveBeenCalledWith('space-1', 'attr-1');
      });
    });
  });
});
