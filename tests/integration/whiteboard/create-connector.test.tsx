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

describe('T011: Create Connector Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    mockWrapper.mockClear();
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  async function renderCanvas(extraProps: Record<string, any> = {}) {
    render(
      <WhiteboardCanvas
        spaceSlug="test-space"
        {...extraProps}
      />,
      { wrapper: createWrapper(queryClient) }
    );

    await screen.findByTestId('excalidraw-mock');

    await waitFor(() => {
      expect(mockWrapper).toHaveBeenCalled();
    });

    return mockWrapper.mock.calls[mockWrapper.mock.calls.length - 1][0];
  }

  const createRectangle = (id: string, x: number, y: number) => ({
    id,
    type: 'rectangle',
    x,
    y,
    width: 100,
    height: 50,
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
    boundElements: [{ id: 'arrow-1', type: 'arrow' }],
    updated: Date.now(),
    link: null,
    locked: false,
    index: 'a0',
  });

  const createArrow = () => ({
    id: 'arrow-1',
    type: 'arrow',
    x: 200,
    y: 100,
    width: 200,
    height: 0,
    points: [
      [0, 0],
      [200, 0],
    ],
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
    startBinding: { elementId: 'rect-1', focus: 0, gap: 1 },
    endBinding: { elementId: 'rect-2', focus: 0, gap: 1 },
    startArrowhead: null,
    endArrowhead: 'arrow',
    index: 'a2',
  });

  it('should expose onChange from wrapper', async () => {
    const props = await renderCanvas();
    expect(props.onChange).toEqual(expect.any(Function));
  });

  it('should accept two shapes connected by an arrow without crashing', async () => {
    const props = await renderCanvas();

    const rect1 = createRectangle('rect-1', 100, 100);
    const rect2 = createRectangle('rect-2', 400, 100);
    const arrow = createArrow();

    act(() => {
      props.onChange?.([rect1, rect2, arrow], { viewBackgroundColor: '#ffffff' });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should preserve arrow bindings in the payload used in test', async () => {
    const props = await renderCanvas();

    const rect1 = createRectangle('rect-1', 100, 100);
    const rect2 = createRectangle('rect-2', 400, 100);
    const arrow = createArrow();

    expect(arrow).toEqual(
      expect.objectContaining({
        startBinding: expect.objectContaining({ elementId: 'rect-1' }),
        endBinding: expect.objectContaining({ elementId: 'rect-2' }),
      })
    );

    act(() => {
      props.onChange?.([rect1, rect2, arrow], { viewBackgroundColor: '#ffffff' });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should accept bidirectional arrow payload without crashing', async () => {
    const props = await renderCanvas();

    const rect1 = createRectangle('rect-1', 100, 100);
    const rect2 = createRectangle('rect-2', 400, 100);
    const bidirectionalArrow = {
      ...createArrow(),
      startArrowhead: 'arrow',
      endArrowhead: 'arrow',
    };

    act(() => {
      props.onChange?.([rect1, rect2, bidirectionalArrow], {
        viewBackgroundColor: '#ffffff',
      });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should handle arrow with missing endBinding without crashing', async () => {
    const props = await renderCanvas();

    const rect1 = createRectangle('rect-1', 100, 100);
    const arrow = {
      ...createArrow(),
      endBinding: null,
    };

    act(() => {
      props.onChange?.([rect1, arrow], { viewBackgroundColor: '#ffffff' });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should accept deleted arrow payload without crashing', async () => {
    const props = await renderCanvas();

    const rect1 = createRectangle('rect-1', 100, 100);
    const rect2 = createRectangle('rect-2', 400, 100);
    const deletedArrow = {
      ...createArrow(),
      isDeleted: true,
    };

    act(() => {
      props.onChange?.([rect1, rect2, deletedArrow], {
        viewBackgroundColor: '#ffffff',
      });
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });
});