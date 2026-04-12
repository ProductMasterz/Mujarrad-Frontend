'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatPanel } from '@/components/chat/ChatPanel';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const spaceSlug = searchParams.get('space_slug') || 'demo-rel-ui-fixed';

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="h-[calc(100vh-120px)] overflow-hidden rounded-lg border bg-card">
        <ChatPanel spaceSlug={spaceSlug} title="Chat" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-6">
          <div className="h-[calc(100vh-120px)] overflow-hidden rounded-lg border bg-card flex items-center justify-center">
            Loading chat...
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
