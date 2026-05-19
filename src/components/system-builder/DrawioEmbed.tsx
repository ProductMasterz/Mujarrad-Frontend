'use client';

import { useEffect, useRef, useCallback } from 'react';

interface DrawioEmbedProps {
  xml: string;
  onXmlChange?: (xml: string) => void;
  className?: string;
}

const DRAWIO_URL = 'https://embed.diagrams.net/?embed=1&spin=1&proto=json&libraries=1&ui=kennedy';

export function DrawioEmbed({ xml, onXmlChange, className }: DrawioEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);

  const sendToFrame = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), '*');
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      let data: { event?: string; xml?: string };
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data.event === 'init') {
        readyRef.current = true;
        if (xml) {
          sendToFrame({ action: 'load', xml });
        }
      }

      if (data.event === 'export' && data.xml) {
        onXmlChange?.(data.xml);
      }

      // Auto-export whenever the diagram is saved/changed
      if (data.event === 'save') {
        sendToFrame({ action: 'export', format: 'xml', xml: '' });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [xml, sendToFrame, onXmlChange]);

  // If xml changes after init, reload
  useEffect(() => {
    if (readyRef.current && xml) {
      sendToFrame({ action: 'load', xml });
    }
  }, [xml, sendToFrame]);

  return (
    <iframe
      ref={iframeRef}
      src={DRAWIO_URL}
      className={className}
      style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
      title="draw.io diagram editor"
    />
  );
}
