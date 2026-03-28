'use client';

import { useSearchParams } from 'next/navigation';
import { ChatWorkspace } from '@/components/chat/ChatWorkspace';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const spaceSlug = searchParams.get('space_slug') || 'demo-space';

  return <ChatWorkspace spaceSlug={spaceSlug} mode="page" />;
}