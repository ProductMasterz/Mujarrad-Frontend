import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { whiteboardService } from '@/services/whiteboardService';
import type { ExcalidrawElement } from '@/types/whiteboard';

// Mock Excalidraw with onChange capture
let capturedOnChange: ((elements: ExcalidrawElement[], appState: any) => void) | null = null;

jest.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: ({ onChange, initialData }: any) => {
    capturedOnChange = onChange;
    return (
      <div data-testid="excalidraw-mock">
        Excalidraw Mock
        <button
          data-testid="trigger-change"
          onClick={() => {
            if (onChange) {
              onChange(
                [
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
                ],
                { viewBackgroundColor: '#ffffff' }
              );
            }
          }}
        >
          Create Rectangle
        </button>
      </div>
    );
  },
}));

// Mock whiteboard service
jest.mock('@/services/whiteboardService', () => ({
  whiteboardService: {
    saveWhiteboardData: jest.fn(),
  },
}));

const mockSaveWhiteboardData = whiteboardService.saveWhiteboardData as jest.MockedFunction<
  typeof whiteboardService.saveWhiteboardData
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

describe('T010: Create Shape Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    mockSaveWhiteboardData.mockReset();
    mockSaveWhiteboardData.mockResolvedValue({ success: true });
    capturedOnChange = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  describe('Shape Creation via Excalidraw API', () => {
    it('should create a rectangle element', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const triggerButton = screen.getByTestId('trigger-change');

      act(() => {
        triggerButton.click();
      });

      expect(capturedOnChange).not.toBeNull();
    });

    it('should call onChange handler when shape is created', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(capturedOnChange).toBeDefined();

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(
            [
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
            ],
            { viewBackgroundColor: '#ffffff' }
          );
        }
      });

      // Handler should be called, but save should be debounced
      expect(mockSaveWhiteboardData).not.toHaveBeenCalled();
    });
  });

  describe('Debounced Save Behavior', () => {
    it('should debounce API calls when multiple changes occur', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      // Trigger multiple changes rapidly
      act(() => {
        for (let i = 0; i < 5; i++) {
          if (capturedOnChange) {
            capturedOnChange(
              [
                {
                  id: `rect-${i}`,
                  type: 'rectangle',
                  x: 100 + i * 10,
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
              ],
              { viewBackgroundColor: '#ffffff' }
            );
          }
        }
      });

      // No save should have happened yet
      expect(mockSaveWhiteboardData).not.toHaveBeenCalled();
    });

    it('should make API call after debounce period', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(
            [
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
            ],
            { viewBackgroundColor: '#ffffff' }
          );
        }
      });

      // Fast-forward past debounce period (assuming 1000ms)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalledTimes(1);
      });
    });

    it('should send correct data structure to API', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const rectangleElement = {
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
      };

      act(() => {
        if (capturedOnChange) {
          capturedOnChange([rectangleElement], { viewBackgroundColor: '#ffffff' });
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
                type: 'rectangle',
              }),
            ]),
          })
        );
      });
    });

    it('should only call API once for multiple rapid changes', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      // Simulate rapid changes
      act(() => {
        for (let i = 0; i < 10; i++) {
          if (capturedOnChange) {
            capturedOnChange(
              [
                {
                  id: 'rect-1',
                  type: 'rectangle',
                  x: 100 + i,
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
              ],
              { viewBackgroundColor: '#ffffff' }
            );
          }
          jest.advanceTimersByTime(100); // Less than debounce period
        }
      });

      // Advance past final debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Different Shape Types', () => {
    it('should handle ellipse creation', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(
            [
              {
                id: 'ellipse-1',
                type: 'ellipse',
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
            ],
            { viewBackgroundColor: '#ffffff' }
          );
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
                type: 'ellipse',
              }),
            ]),
          })
        );
      });
    });

    it('should handle text element creation', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(
            [
              {
                id: 'text-1',
                type: 'text',
                x: 100,
                y: 100,
                width: 200,
                height: 50,
                text: 'Hello World',
                fontSize: 20,
                fontFamily: 1,
                textAlign: 'left',
                verticalAlign: 'top',
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
            ],
            { viewBackgroundColor: '#ffffff' }
          );
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
                type: 'text',
                text: 'Hello World',
              }),
            ]),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      mockSaveWhiteboardData.mockRejectedValue(new Error('Network error'));

      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      act(() => {
        if (capturedOnChange) {
          capturedOnChange(
            [
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
            ],
            { viewBackgroundColor: '#ffffff' }
          );
        }
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should show error state but not crash
      await waitFor(() => {
        expect(mockSaveWhiteboardData).toHaveBeenCalled();
      });

      // Component should still be rendered
      expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
    });
  });
});
