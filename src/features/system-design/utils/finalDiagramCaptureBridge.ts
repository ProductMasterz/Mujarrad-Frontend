export interface CapturedFinalDiagram {
  xml: string;
  diagramImages: {
    svg: {
      dataUrl: string;
      fileName: string;
    };
    png: {
      dataUrl: string;
      fileName: string;
    };
  };
}

type FinalDiagramCapture =
  () => Promise<CapturedFinalDiagram>;

let registeredCapture:
  | FinalDiagramCapture
  | null = null;

export function registerFinalDiagramCapture(
  capture: FinalDiagramCapture,
) {
  registeredCapture = capture;

  return () => {
    if (registeredCapture === capture) {
      registeredCapture = null;
    }
  };
}

export async function captureRegisteredFinalDiagram() {
  if (!registeredCapture) {
    throw new Error(
      'Draw.io editor is not available.',
    );
  }

  return registeredCapture();
}
