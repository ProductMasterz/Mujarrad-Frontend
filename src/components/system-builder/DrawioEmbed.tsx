'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

export type DrawioExportFormat = 'xml' | 'svg' | 'png';

export interface DrawioEmbedHandle {
  exportDiagram: (
    format: DrawioExportFormat,
  ) => Promise<string>;
}

interface DrawioEmbedProps {
  xml: string;
  onXmlChange?: (xml: string) => void;
  className?: string;
}

const DRAWIO_URL =
  'https://embed.diagrams.net/?embed=1&spin=1&proto=json&libraries=1&ui=kennedy&noExitBtn=1';
  
function extractGraphModelXml(xml: string): string {
  const match = xml.match(/<mxGraphModel\b[\s\S]*<\/mxGraphModel>/);
  return match?.[0] ?? xml;
}

function sanitizeDrawioXml(inputXml: string): string {
  const rawModel = extractGraphModelXml(inputXml).trim();

  if (!rawModel) {
    return getFallbackDiagramXml();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawModel, 'application/xml');

  if (doc.querySelector('parsererror')) {
    return getFallbackDiagramXml();
  }

  const model = doc.querySelector('mxGraphModel');
  const root = doc.querySelector('root');

  if (!model || !root) {
    return getFallbackDiagramXml();
  }

  const allCells = Array.from(root.children).filter(
    (child): child is Element => child.tagName === 'mxCell',
  );

  const normalCells = allCells.filter((cell) => {
    const id = cell.getAttribute('id');
    return id !== '0' && id !== '1';
  });

  const idMap = new Map<string, string>();
  let nextId = 2;

  const rebuiltCells = normalCells
    .map((oldCell) => {
      const cloned = oldCell.cloneNode(true) as Element;
      const oldId = cloned.getAttribute('id');

      if (!oldId) return null;

      const newId = String(nextId++);
      idMap.set(oldId, newId);
      cloned.setAttribute('id', newId);

      if (!cloned.getAttribute('parent') || cloned.getAttribute('parent') === '0') {
        cloned.setAttribute('parent', '1');
      }

      return cloned;
    })
    .filter((cell): cell is Element => Boolean(cell));

  for (const cell of rebuiltCells) {
    const source = cell.getAttribute('source');
    const target = cell.getAttribute('target');

    if (source && idMap.has(source)) {
      cell.setAttribute('source', idMap.get(source)!);
    }

    if (target && idMap.has(target)) {
      cell.setAttribute('target', idMap.get(target)!);
    }

    if (cell.getAttribute('edge') === '1') {
      const fixedSource = cell.getAttribute('source');
      const fixedTarget = cell.getAttribute('target');

      if (!fixedSource || !fixedTarget) {
        cell.remove();
      }
    }
  }

  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  const root0 = doc.createElement('mxCell');
  root0.setAttribute('id', '0');

  const root1 = doc.createElement('mxCell');
  root1.setAttribute('id', '1');
  root1.setAttribute('parent', '0');

  root.appendChild(root0);
  root.appendChild(root1);

  for (const cell of rebuiltCells) {
    if (cell.parentNode) {
      cell.parentNode.removeChild(cell);
    }

    if (cell.getAttribute('edge') === '1') {
      const source = cell.getAttribute('source');
      const target = cell.getAttribute('target');

      if (!source || !target) continue;
    }

    root.appendChild(cell);
  }

  const serialized = new XMLSerializer().serializeToString(model);

  if (!serialized.includes('<mxCell id="2"') && rebuiltCells.length === 0) {
    return getFallbackDiagramXml();
  }

  return serialized;
}

function getFallbackDiagramXml(): string {
  return `<mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Input" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="80" y="160" width="140" height="70" as="geometry"/></mxCell><mxCell id="3" value="System Builder" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="320" y="160" width="180" height="70" as="geometry"/></mxCell><mxCell id="4" value="Draw.io Diagram" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="620" y="160" width="180" height="70" as="geometry"/></mxCell><mxCell id="5" value="" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell><mxCell id="6" value="" style="endArrow=block;html=1;rounded=0;" edge="1" parent="1" source="3" target="4"><mxGeometry relative="1" as="geometry"/></mxCell></root></mxGraphModel>`;
}

export const DrawioEmbed = forwardRef<
  DrawioEmbedHandle,
  DrawioEmbedProps
>(function DrawioEmbed(
  { xml, onXmlChange, className },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadedRef = useRef(false);

  const pendingExportsRef = useRef(
    new Map<
      DrawioExportFormat,
      {
        resolve: (value: string) => void;
        reject: (error: Error) => void;
        timeoutId: ReturnType<typeof setTimeout>;
      }
    >(),
  );

  const safeXml = useMemo(() => sanitizeDrawioXml(xml), [xml]);

  const sendToFrame = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify(msg),
      '*',
    );
  }, []);

  const exportDiagram = useCallback(
    (format: DrawioExportFormat): Promise<string> =>
      new Promise((resolve, reject) => {
        if (!loadedRef.current) {
          reject(
            new Error('Draw.io editor is not ready.'),
          );
          return;
        }

        const existing =
          pendingExportsRef.current.get(format);

        if (existing) {
          clearTimeout(existing.timeoutId);
          existing.reject(
            new Error(
              `A ${format.toUpperCase()} export is already pending.`,
            ),
          );
        }

        const timeoutId = setTimeout(() => {
          pendingExportsRef.current.delete(format);

          reject(
            new Error(
              `${format.toUpperCase()} export timed out.`,
            ),
          );
        }, 30000);

        pendingExportsRef.current.set(format, {
          resolve,
          reject,
          timeoutId,
        });

        sendToFrame({
          action: 'export',
          format,
          border: 16,
        });
      }),
    [sendToFrame],
  );

  useImperativeHandle(
    ref,
    () => ({
      exportDiagram,
    }),
    [exportDiagram],
  );

  useEffect(() => {
    loadedRef.current = false;
  }, [safeXml]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      let data: {
        event?: string;
        xml?: string;
        format?: string;
        data?: string;
      };
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data.event === 'init' && !loadedRef.current) {
        loadedRef.current = true;

        sendToFrame({
          action: 'load',
          xml: safeXml,
        });

        return;
      }

      if (data.event === 'export') {
        if (
          (data.format === 'svg' ||
            data.format === 'png') &&
          data.data
        ) {
          const format = data.format;
          const pending =
            pendingExportsRef.current.get(format);

          if (pending) {
            clearTimeout(pending.timeoutId);
            pendingExportsRef.current.delete(format);
            pending.resolve(data.data);
          }

          return;
        }

        if (data.xml) {
          const finalXml = sanitizeDrawioXml(data.xml);
          const pending =
            pendingExportsRef.current.get('xml');

          if (pending) {
            clearTimeout(pending.timeoutId);
            pendingExportsRef.current.delete('xml');
            pending.resolve(finalXml);
          } else {
            onXmlChange?.(finalXml);
          }

          return;
        }
      }

      if (data.event === 'save') {
        sendToFrame({ action: 'export', format: 'xml' });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [safeXml, sendToFrame, onXmlChange]);

  return (
    <iframe
      key={safeXml}
      ref={iframeRef}
      src={DRAWIO_URL}
      className={className}
      style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
      title="draw.io diagram editor"
    />
  );
});
