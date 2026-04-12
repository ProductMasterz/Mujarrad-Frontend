import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
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
    mockWrapper.mockClear();
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  async function renderCanvas() {
    render(<WhiteboardCanvas spaceSlug="test-space" />, {
      wrapper: createWrapper(queryClient),
    });

    await screen.findByTestId('excalidraw-mock');

    await waitFor(() => {
      expect(mockWrapper).toHaveBeenCalled();
    });

    return mockWrapper.mock.calls[mockWrapper.mock.calls.length - 1][0];
  }

  it('should expose onChange from ExcalidrawWrapper', async () => {
    const props = await renderCanvas();

    expect(props).toEqual(
      expect.objectContaining({
        onChange: expect.any(Function),
      })
    );
  });

  it('should accept rectangle change payload without crashing', async () => {
    const props = await renderCanvas();

    const rectangleElement = {
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
    };

    act(() => {
      props.onChange?.([rectangleElement], { viewBackgroundColor: '#ffffff' });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should accept ellipse payload without crashing', async () => {
    const props = await renderCanvas();

    const ellipseElement = {
      id: 'ellipse-1',
      type: 'ellipse',
      x: 120,
      y: 120,
      width: 180,
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
      index: 'a1',
    };

    act(() => {
      props.onChange?.([ellipseElement], { viewBackgroundColor: '#ffffff' });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should accept multiple rapid shape changes without crashing', async () => {
    const props = await renderCanvas();

    act(() => {
      for (let i = 0; i < 5; i++) {
        props.onChange?.(
          [
            {
              id: `rect-${i}`,
              type: 'rectangle',
              x: 100 + i,
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
          ],
          { viewBackgroundColor: '#ffffff' }
        );
      }
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });
});