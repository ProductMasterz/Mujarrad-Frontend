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

describe('T012: Persistence Tests', () => {
  let queryClient: QueryClient;

  const sampleElements = [
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
    {
      id: 'ellipse-1',
      type: 'ellipse',
      x: 400,
      y: 100,
      width: 150,
      height: 100,
      angle: 0,
      strokeColor: '#ff0000',
      backgroundColor: '#ffcccc',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: 54321,
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      index: 'a1',
    },
  ];

  const initialAppState = {
    viewBackgroundColor: '#ffffff',
    zoom: { value: 1.5 },
    scrollX: 100,
    scrollY: 50,
  };

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

  it('should pass provided initial elements and appState to wrapper', async () => {
    const props = await renderCanvas({
      initialElements: sampleElements,
      initialAppState,
    });

    expect(props).toEqual(
      expect.objectContaining({
        initialElements: sampleElements,
        initialAppState,
      })
    );
  });

  it('should initialize empty when no data is provided', async () => {
    const props = await renderCanvas();

    expect(props).toEqual(
      expect.objectContaining({
        initialElements: [],
        initialAppState: {},
      })
    );
  });

  it('should accept changed elements payload without crashing', async () => {
    const props = await renderCanvas({
      initialElements: sampleElements,
      initialAppState,
    });

    act(() => {
      props.onChange?.(sampleElements, initialAppState);
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should preserve element ids across initial payload', async () => {
    const props = await renderCanvas({
      initialElements: sampleElements,
      initialAppState,
    });

    expect(props.initialElements.map((e: any) => e.id)).toEqual(
      expect.arrayContaining(['rect-1', 'ellipse-1'])
    );
  });

  it('should accept modified restored elements without crashing', async () => {
    const props = await renderCanvas({
      initialElements: sampleElements,
      initialAppState,
    });

    const modifiedElements = sampleElements.map((el) =>
      el.id === 'rect-1' ? { ...el, x: 200, y: 200 } : el
    );

    act(() => {
      props.onChange?.(modifiedElements, initialAppState);
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });

  it('should keep rendering after onChange flow', async () => {
    const props = await renderCanvas({
      initialElements: sampleElements,
      initialAppState,
    });

    act(() => {
      props.onChange?.(sampleElements, initialAppState);
    });

    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
  });
});