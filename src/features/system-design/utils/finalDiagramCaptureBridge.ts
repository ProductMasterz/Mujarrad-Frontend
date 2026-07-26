import type {
  DiagramRenderer,
} from '../types/layer1.types';

export interface CapturedFinalDiagram {
  renderer: DiagramRenderer;

  xml?: string;
  mermaidSource?: string;

  diagramImages: {
    svg: {
      dataUrl: string;
      fileName: string;
    };

    png?: {
      dataUrl: string;
      fileName: string;
    };
  };
}

type FinalDiagramCapture =
  () => Promise<CapturedFinalDiagram>;

const registeredCaptures =
  new Map<
    DiagramRenderer,
    FinalDiagramCapture
  >();

export function registerFinalDiagramCapture(
  renderer: DiagramRenderer,
  capture: FinalDiagramCapture,
) {
  registeredCaptures.set(
    renderer,
    capture,
  );

  return () => {
    if (
      registeredCaptures.get(renderer) ===
      capture
    ) {
      registeredCaptures.delete(
        renderer,
      );
    }
  };
}

export async function captureRegisteredFinalDiagram(
  renderer: DiagramRenderer,
) {
  const capture =
    registeredCaptures.get(renderer);

  if (!capture) {
    throw new Error(
      `${renderer === 'drawio' ? 'Draw.io' : 'Mermaid'} diagram preview is not available.`,
    );
  }

  return capture();
}
