import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';

const mockWrapper = jest.fn();

jest.mock('@/components/whiteboard/ExcalidrawWrapper', () => ({
  __esModule: true,
  default: (props: any) => {
    mockWrapper(props);
    props.onMount?.({} as any);
    return <div data-testid="excalidraw-mock">Excalidraw Mock</div>;
  },
}));

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
    };
    mockWrapper.mockClear();
  });

  afterEach(() => {
    cleanup();
    console.error = originalConsoleError;
    queryClient.cancelQueries();
    queryClient.clear();  
  });

  describe('Component Rendering', () => {
    it('should render WhiteboardCanvas component', async () => {
      render(<WhiteboardCanvas spaceSlug="test-space" />, {
        wrapper: createWrapper(queryClient),
      });

      expect(await screen.findByTestId('excalidraw-mock')).toBeInTheDocument();
    });

    it('should mount ExcalidrawWrapper correctly', () => {
      render(<WhiteboardCanvas spaceSlug="test-space" />, {
        wrapper: createWrapper(queryClient),
      });

      expect(mockWrapper).toHaveBeenCalled();
    });

    it('should pass required props to ExcalidrawWrapper', () => {
      render(<WhiteboardCanvas spaceSlug="test-space" />, {
        wrapper: createWrapper(queryClient),
      });

      const props = mockWrapper.mock.calls[0][0];

      expect(props).toEqual(
        expect.objectContaining({
          onChange: expect.any(Function),
          onMount: expect.any(Function),
          readOnly: false,
        })
      );
    });

    it('should render without console errors', async () => {
      render(<WhiteboardCanvas spaceSlug="test-space" />, {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
      });

      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes('React Query') &&
          !error.includes('act(') &&
          !error.includes('Warning:')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    it('should have a root container', () => {
      const { container } = render(<WhiteboardCanvas spaceSlug="test-space" />, {
        wrapper: createWrapper(queryClient),
      });

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Initial Data Loading', () => {
    it('should initialize with empty elements when none are provided', () => {
      render(<WhiteboardCanvas spaceSlug="test-space" />, {
        wrapper: createWrapper(queryClient),
      });

      const props = mockWrapper.mock.calls[0][0];

      expect(props).toEqual(
        expect.objectContaining({
          initialElements: [],
        })
      );
    });

    it('should pass existing whiteboard data when provided', () => {
      const initialElements = [
        {
          id: 'rect-1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          fillStyle: 'hachure',
          strokeWidth: 1,
          strokeStyle: 'solid',
          roughness: 1,
          opacity: 100,
          groupIds: [],
          frameId: null,
          roundness: null,
          seed: 12345,
          version: 1,
          versionNonce: 1,
          isDeleted: false,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: false,
          index: 'a0',
        },
      ];

      const initialAppState = {
        viewBackgroundColor: '#ffffff',
      };

      render(
        <WhiteboardCanvas
          spaceSlug="test-space"
          initialElements={initialElements as any}
          initialAppState={initialAppState as any}
        />,
        { wrapper: createWrapper(queryClient) }
      );

      const props = mockWrapper.mock.calls[0][0];

      expect(props).toEqual(
        expect.objectContaining({
          initialElements,
          initialAppState,
        })
      );
    });
  });

  describe('Wrapper Configuration', () => {
    it('should pass readOnly mode to ExcalidrawWrapper', () => {
      render(<WhiteboardCanvas spaceSlug="test-space" readOnly={true} />, {
        wrapper: createWrapper(queryClient),
      });

      const props = mockWrapper.mock.calls[0][0];

      expect(props).toEqual(
        expect.objectContaining({
          readOnly: true,
        })
      );
    });
  });
});