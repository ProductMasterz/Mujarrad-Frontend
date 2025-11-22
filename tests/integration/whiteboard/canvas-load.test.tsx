import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import type { WhiteboardData } from '@/types/whiteboard';

// Mock Excalidraw
const mockExcalidraw = jest.fn();
jest.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: (props: any) => {
    mockExcalidraw(props);
    return <div data-testid="excalidraw-mock">Excalidraw Mock</div>;
  },
}));

// Mock console.error to track errors
const originalConsoleError = console.error;
let consoleErrors: string[] = [];

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

describe('T009: WhiteboardCanvas Component Load Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    consoleErrors = [];
    console.error = (...args: any[]) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError(...args);
    };
    mockExcalidraw.mockClear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    queryClient.clear();
  });

  describe('Component Rendering', () => {
    it('should render WhiteboardCanvas component', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
    });

    it('should mount Excalidraw correctly', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalled();
    });

    it('should pass required props to Excalidraw', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalledWith(
        expect.objectContaining({
          onChange: expect.any(Function),
        })
      );
    });

    it('should render without console errors', async () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
      });

      // Filter out expected React Query or testing library warnings
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes('React Query') &&
          !error.includes('act(') &&
          !error.includes('Warning:')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    it('should have a container with proper dimensions', () => {
      const { container } = render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      const whiteboardContainer = container.querySelector('[data-testid="whiteboard-container"]');
      expect(whiteboardContainer).toBeInTheDocument();
    });
  });

  describe('Initial Data Loading', () => {
    it('should initialize with empty elements when no data exists', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalledWith(
        expect.objectContaining({
          initialData: expect.objectContaining({
            elements: [],
          }),
        })
      );
    });

    it('should load existing whiteboard data when provided', () => {
      const existingData: WhiteboardData = {
        elements: [
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
        appState: {
          viewBackgroundColor: '#ffffff',
        },
      };

      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          initialData={existingData}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalledWith(
        expect.objectContaining({
          initialData: expect.objectContaining({
            elements: existingData.elements,
          }),
        })
      );
    });

    it('should display loading state while fetching data', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" isLoading={true} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByTestId('whiteboard-loading')).toBeInTheDocument();
    });

    it('should display error state when loading fails', () => {
      render(
        <WhiteboardCanvas
          spaceId="space-1"
          nodeId="node-1"
          error="Failed to load whiteboard data"
        />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(screen.getByTestId('whiteboard-error')).toBeInTheDocument();
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  describe('Excalidraw Configuration', () => {
    it('should configure Excalidraw with collaboration disabled', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalledWith(
        expect.objectContaining({
          isCollaborating: false,
        })
      );
    });

    it('should configure view mode based on readOnly prop', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" readOnly={true} />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalledWith(
        expect.objectContaining({
          viewModeEnabled: true,
        })
      );
    });

    it('should configure theme based on user preference', () => {
      render(
        <WhiteboardCanvas spaceId="space-1" nodeId="node-1" theme="dark" />,
        { wrapper: createWrapper(queryClient) }
      );

      expect(mockExcalidraw).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
        })
      );
    });
  });
});
