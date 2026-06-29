'use client';

import { useState } from 'react';

import { DrawioEmbed } from '@/components/system-builder/DrawioEmbed';

import { useLayer1Store } from '../stores/useLayer1Store';

/**
 * Loads the generated diagram into the Draw.io embed exactly once per
 * generation. The initial XML is captured on mount so that persisting manual
 * edits back to the store does not re-drive (and reload) the editor.
 */
function DiagramEditorInstance({
  onXmlChange,
}: {
  onXmlChange: (xml: string) => void;
}) {
  const [initialXml] = useState(
    () => useLayer1Store.getState().graphState.drawioXml,
  );

  return <DrawioEmbed xml={initialXml} onXmlChange={onXmlChange} />;
}

export function Layer1DiagramReview() {
  const setDrawioXml = useLayer1Store((state) => state.setDrawioXml);

  // Changes only when a new diagram is generated, not on manual edits. Used to
  // remount the editor so a regenerated diagram is loaded fresh.
  const generationKey = useLayer1Store((state) => {
    const revisions = state.graphState.diagramRevisions;
    return revisions[revisions.length - 1]?.id ?? 'initial';
  });

  return (
    <div className="h-full w-full">
      <DiagramEditorInstance key={generationKey} onXmlChange={setDrawioXml} />
    </div>
  );
}
