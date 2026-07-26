'use client';

import {
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';

import {
  registerFinalDiagramCapture,
} from '../utils/finalDiagramCaptureBridge';

interface MermaidDiagramPreviewProps {
  source: string;
}

export function MermaidDiagramPreview({
  source,
}: MermaidDiagramPreviewProps) {
  const reactId =
    useId();

  const [svg, setSvg] =
    useState('');

  const [error, setError] =
    useState<string | null>(null);

  const [showSource, setShowSource] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!source.trim()) {
        setSvg('');
        setError(
          'No Mermaid diagram source is available.',
        );
        return;
      }

      try {
        setError(null);

        const mermaidModule =
          await import('mermaid');

        const mermaid =
          mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          flowchart: {
            htmlLabels: false,
            curve: 'basis',
            nodeSpacing: 55,
            rankSpacing: 85,
            useMaxWidth: true,
          },
          themeVariables: {
            fontFamily:
              'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '15px',
            primaryColor: '#f8fafc',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#475569',
            lineColor: '#64748b',
            secondaryColor: '#eff6ff',
            tertiaryColor: '#f1f5f9',
            clusterBkg: '#ffffff',
            clusterBorder: '#cbd5e1',
          },
        });

        const renderId =
          `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;

        const result =
          await mermaid.render(
            renderId,
            source,
          );

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (renderError) {
        if (!cancelled) {
          setSvg('');

          setError(
            renderError instanceof Error
              ? renderError.message
              : 'Mermaid could not render the diagram.',
          );
        }
      }
    }

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [reactId, source]);

  const captureMermaidDiagram =
    useCallback(async () => {
      if (!svg) {
        throw new Error(
          'The Mermaid SVG has not finished rendering.',
        );
      }

      const svgBlob =
        new Blob(
          [svg],
          {
            type: 'image/svg+xml',
          },
        );

      const svgDataUrl =
        await blobToDataUrl(svgBlob);

      let pngDataUrl:
        string | undefined;

      try {
        pngDataUrl =
          await svgToPngDataUrl(svg);
      } catch (pngError) {
        console.warn(
          'Mermaid PNG export was skipped. SVG export remains available.',
          pngError,
        );
      }

      return {
        renderer:
          'mermaid' as const,

        mermaidSource:
          source,

        diagramImages: {
          svg: {
            dataUrl:
              svgDataUrl,

            fileName:
              'final-system-diagram.svg',
          },

          ...(pngDataUrl
            ? {
                png: {
                  dataUrl:
                    pngDataUrl,

                  fileName:
                    'final-system-diagram.png',
                },
              }
            : {}),
        },
      };
    }, [source, svg]);

  useEffect(
    () =>
      registerFinalDiagramCapture(
        'mermaid',
        captureMermaidDiagram,
      ),
    [captureMermaidDiagram],
  );

  return (
    <div className="flex min-h-[820px] h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-sm font-black text-slate-900">
            Mermaid Preview
          </div>

          <div className="text-xs text-slate-500">
            Generated from the same semantic architecture model as Draw.io.
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowSource(
              (current) => !current,
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
        >
          {showSource
            ? 'Show Diagram'
            : 'Show Mermaid Source'}
        </button>
      </div>

      {showSource ? (
        <pre className="flex-1 overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-100">
          <code>{source}</code>
        </pre>
      ) : error ? (
        <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-black">
            Mermaid rendering failed
          </div>

          <div className="mt-2 whitespace-pre-wrap font-mono text-xs">
            {error}
          </div>
        </div>
      ) : svg ? (
        <div className="flex-1 overflow-auto bg-slate-50 p-8">
          <div
            className="mx-auto min-w-max rounded-xl bg-white p-6 shadow-sm [&_svg]:h-auto [&_svg]:min-w-[1100px] [&_svg]:max-w-none"
            dangerouslySetInnerHTML={{
              __html: svg,
            }}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm font-medium text-slate-500">
          Rendering Mermaid diagram…
        </div>
      )}
    </div>
  );
}


function blobToDataUrl(
  blob: Blob,
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result ===
          'string'
        ) {
          resolve(reader.result);
          return;
        }

        reject(
          new Error(
            'Could not encode the Mermaid SVG.',
          ),
        );
      };

      reader.onerror = () => {
        reject(
          reader.error ??
            new Error(
              'Could not read the Mermaid SVG.',
            ),
        );
      };

      reader.readAsDataURL(blob);
    },
  );
}

async function svgToPngDataUrl(
  svg: string,
): Promise<string> {
  const svgBlob =
    new Blob(
      [svg],
      {
        type: 'image/svg+xml',
      },
    );

  const objectUrl =
    URL.createObjectURL(svgBlob);

  try {
    const image =
      await loadImage(objectUrl);

    const width =
      Math.max(
        image.naturalWidth,
        image.width,
        1600,
      );

    const height =
      Math.max(
        image.naturalHeight,
        image.height,
        900,
      );

    const canvas =
      document.createElement(
        'canvas',
      );

    canvas.width =
      width * 2;

    canvas.height =
      height * 2;

    const context =
      canvas.getContext('2d');

    if (!context) {
      throw new Error(
        'Could not create the Mermaid PNG canvas.',
      );
    }

    context.scale(2, 2);

    context.fillStyle =
      '#ffffff';

    context.fillRect(
      0,
      0,
      width,
      height,
    );

    context.drawImage(
      image,
      0,
      0,
      width,
      height,
    );

    return canvas.toDataURL(
      'image/png',
    );
  } finally {
    URL.revokeObjectURL(
      objectUrl,
    );
  }
}

function loadImage(
  source: string,
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            'Could not render Mermaid as PNG.',
          ),
        );

      image.src = source;
    },
  );
}
