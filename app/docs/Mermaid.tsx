'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Load and initialise mermaid exactly once across the whole page.
let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;
function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

/**
 * Renders a fenced ```mermaid block as an SVG diagram. Falls back to showing
 * the raw source if the diagram fails to parse, so a bad diagram never blanks
 * the page.
 */
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const diagramId = `docs-mermaid-${uid}`;
  const source = chart.trim();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await getMermaid();
        const { svg } = await mermaid.render(diagramId, source);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Invalid diagram syntax');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, diagramId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5">
        <span className="text-xs font-medium text-[#828282]">◇ Diagram</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-[#828282] transition-colors hover:bg-[#f0f0f0] hover:text-[#333]"
          title="Copy diagram source"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {error ? (
        <div className="p-4">
          <p className="mb-2 text-xs font-medium text-red-500">Could not render diagram — showing source:</p>
          <pre className="m-0 overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-3 text-[12px] leading-5 text-gray-100">
            {source}
          </pre>
        </div>
      ) : (
        <div
          ref={ref}
          className="mermaid-diagram overflow-x-auto p-4 text-center [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-w-full"
        />
      )}
    </div>
  );
}
