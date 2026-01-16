import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { whiteboardService } from '@/services/whiteboardService';
import type { ExcalidrawElement, WhiteboardData } from '@/types/whiteboard';

// Mock Excalidraw with onChange and initialData capture
let capturedOnChange: ((elements: ExcalidrawElement[], appState: any) => void) | null = null;
let capturedInitialData: WhiteboardData | null = null;

jest.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: ({ onChange, initialData }: any) => {
    capturedOnChange = onChange;
    capturedInitialData = initialData;
    return (
      <div data-testid="excalidraw-mock">
        Excalidraw Mock
        <div data-testid="initial-elements-count">
          {initialData?.elements?.length || 0}
        </div>
      </div>
    );
  },
}));

// Mock whiteboard service
jest.mock('@/services/whiteboardService', () => ({
  whiteboardService: {
    saveWhiteboardData: jest.fn(),
    getWhiteboardData: jest.fn(),
  },
}));

const mockSaveWhiteboardData = whiteboardService.saveWhiteboardData as jest.MockedFunction<
  typeof whiteboardService.saveWhiteboardData
>;

const mockGetWhiteboardData = whiteboardService.getWhiteboardData as jest.MockedFunction<
  typeof whiteboardService.getWhiteboardData
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

describe('T012: Persistence Tests', () => {
  let queryClient: QueryClient;

  const sampleElements: ExcalidrawElement[] = [
    {
      id: 'rect-1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'hachure',
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
    },
    {
      id: 'ellipse-1',
      type: 'ellipse',
      x: 400,
      y: 100,
      width: 150,
      height: 100,
      strokeColor: '#ff0000',
      backgroundColor: '#ffcccc',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 0,
      opacity: 100,
      angle: 0,
      seed: 54321,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
    },
  ];

  beforeEach(() => {
    queryClient = createQueryClient();
    mockSaveWhiteboardData.mockReset();
    mockGetWhiteboardData.mockReset();
    mockSaveWhiteboardData.mockResolvedValue({ success: true });
    capturedOnChange = null;
    capturedInitialData = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  describe('Save to Backend', () => {
    it('should save elements to backend after changes', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, { viewBackgroundColor: '#ffffff' });
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
            elements: sampleElements,
            appState: expect.objectContaining({
              viewBackgroundColor: '#ffffff',
            }),
          })
        );
      });
    });

    it('should include all element properties in saved data', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const savedData = mockSaveWhiteboardData.mock.calls[0][2];
        const savedRect = savedData.elements.find((e: ExcalidrawElement) => e.id === 'rect-1');

        expect(savedRect).toMatchObject({
          id: 'rect-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
        });
      });
    });

    it('should save appState with whiteboard data', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const appState = {
        viewBackgroundColor: '#f5f5f5',
        currentItemFontFamily: 1,
        currentItemFontSize: 20,
        zoom: { value: 1.5 },
        scrollX: 100,
        scrollY: 50,
      };

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, appState);
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
            appState: expect.objectContaining({
              viewBackgroundColor: '#f5f5f5',
            }),
          })
        );
      });
    });
  });

  describe('Restore from Backend', () => {
    it('should load existing whiteboard data on mount', async () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      mockGetWhiteboardData.mockResolvedValue(savedData);

      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(mockGetWhiteboardData).toHaveBeenCalledWith('space-1', 'node-1');
      });
    });

    it('should pass loaded elements to Excalidraw initialData', async () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(capturedInitialData).toEqual(
        expect.objectContaining({
          elements: sampleElements,
        })
      );
    });

    it('should restore element positions correctly', () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const restoredRect = capturedInitialData?.elements.find(
        (e) => e.id === 'rect-1'
      );

      expect(restoredRect).toMatchObject({
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      });
    });

    it('should restore element styles correctly', () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const restoredEllipse = capturedInitialData?.elements.find(
        (e) => e.id === 'ellipse-1'
      );

      expect(restoredEllipse).toMatchObject({
        strokeColor: '#ff0000',
        backgroundColor: '#ffcccc',
        fillStyle: 'solid',
        strokeWidth: 2,
      });
    });

    it('should restore appState including zoom and scroll', () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: {
          viewBackgroundColor: '#f5f5f5',
          zoom: { value: 1.5 },
          scrollX: 100,
          scrollY: 50,
        },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(capturedInitialData?.appState).toMatchObject({
        viewBackgroundColor: '#f5f5f5',
        zoom: { value: 1.5 },
        scrollX: 100,
        scrollY: 50,
      });
    });
  });

  describe('Round-trip Persistence', () => {
    it('should save and restore elements correctly across remounts', async () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      mockGetWhiteboardData.mockResolvedValue(savedData);

      // First mount - create elements
      const { unmount } = render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalled();
      });

      // Unmount
      unmount();

      // Clear captured values
      capturedOnChange = null;
      capturedInitialData = null;

      // Second mount - should restore
      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(capturedInitialData?.elements).toHaveLength(2);
      expect(capturedInitialData?.elements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'rect-1' }),
          expect.objectContaining({ id: 'ellipse-1' }),
        ])
      );
    });

    it('should preserve element IDs across save/restore cycle', async () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const elementIds = capturedInitialData?.elements.map((e) => e.id);
      expect(elementIds).toContain('rect-1');
      expect(elementIds).toContain('ellipse-1');
    });

    it('should handle modifications to restored elements', async () => {
      const savedData: WhiteboardData = {
        elements: sampleElements,
        appState: { viewBackgroundColor: '#ffffff' },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={savedData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      // Modify restored elements
      const modifiedElements = sampleElements.map((el) =>
        el.id === 'rect-1' ? { ...el, x: 200, y: 200 } : el
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(modifiedElements, { viewBackgroundColor: '#ffffff' });
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
                id: 'rect-1',
                x: 200,
                y: 200,
              }),
            ]),
          })
        );
      });
    });
  });

  describe('Empty State Handling', () => {
    it('should handle empty whiteboard data', () => {
      const emptyData: WhiteboardData = {
        elements: [],
        appState: { viewBackgroundColor: '#ffffff' },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={emptyData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(capturedInitialData?.elements).toHaveLength(0);
    });

    it('should handle null/undefined whiteboard data', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      // Should initialize with empty elements
      expect(capturedInitialData?.elements || []).toHaveLength(0);
    });
  });

  describe('Complex Element Types', () => {
    it('should persist arrow elements with bindings', async () => {
      const elementsWithArrow: ExcalidrawElement[] = [
        ...sampleElements,
        {
          id: 'arrow-1',
          type: 'arrow',
          x: 300,
          y: 150,
          width: 100,
          height: 0,
          points: [
            [0, 0],
            [100, 0],
          ],
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          fillStyle: 'hachure',
          strokeWidth: 1,
          roughness: 1,
          opacity: 100,
          angle: 0,
          seed: 11111,
          version: 1,
          versionNonce: 1,
          isDeleted: false,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
          startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
          endBinding: { elementId: 'ellipse-1', focus: 0, gap: 1 },
          startArrowhead: null,
          endArrowhead: 'arrow',
        } as any,
      ];

      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(elementsWithArrow, { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const savedData = mockSaveWhiteboardData.mock.calls[0][2];
        const savedArrow = savedData.elements.find(
          (e: ExcalidrawElement) => e.id === 'arrow-1'
        );

        expect(savedArrow).toMatchObject({
          type: 'arrow',
          startBinding: expect.objectContaining({ elementId: 'rect-1' }),
          endBinding: expect.objectContaining({ elementId: 'ellipse-1' }),
        });
      });
    });

    it('should persist text elements', async () => {
      const textElement: ExcalidrawElement = {
        id: 'text-1',
        type: 'text',
        x: 100,
        y: 300,
        width: 200,
        height: 50,
        text: 'Hello World',
        fontSize: 20,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        fillStyle: 'hachure',
        strokeWidth: 1,
        roughness: 1,
        opacity: 100,
        angle: 0,
        seed: 22222,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      } as any;

      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([textElement], { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const savedData = mockSaveWhiteboardData.mock.calls[0][2];
        const savedText = savedData.elements.find(
          (e: ExcalidrawElement) => e.id === 'text-1'
        );

        expect(savedText).toMatchObject({
          type: 'text',
          text: 'Hello World',
          fontSize: 20,
        });
      });
    });
  });

  describe('Error Recovery', () => {
    it('should handle save failures gracefully', async () => {
      mockSaveWhiteboardData.mockRejectedValue(new Error('Network error'));

      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Component should still be rendered
      await waitFor(() => {
        expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
      });
    });

    it('should retry save on failure', async () => {
      mockSaveWhiteboardData
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, { viewBackgroundColor: '#ffffff' });
        }
      });

      // First attempt
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Trigger retry by making another change
      act(() => {
        if (capturedOnChange) {
          capturedOnChange(sampleElements, { viewBackgroundColor: '#ffffff' });
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalledTimes(2);
      });
    });
  });
});
