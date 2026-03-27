'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { spaceService } from '@/services/api/space.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [firstSpaceSlug, setFirstSpaceSlug] = useState<string | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setFirstSpaceSlug(null);
      return;
    }

    let active = true;

    const loadSpaces = async () => {
      setIsLoadingSpaces(true);
      try {
        const spaces = await spaceService.getSpaces();
        if (!active) return;
        setFirstSpaceSlug(spaces[0]?.slug || null);
      } catch (error) {
        if (!active) return;
        console.warn('[Home] Could not load spaces for chat deep-link:', error);
        setFirstSpaceSlug(null);
      } finally {
        if (active) {
          setIsLoadingSpaces(false);
        }
      }
    };

    void loadSpaces();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const chatHref = useMemo(() => {
    return firstSpaceSlug ? `/chat?space_slug=${firstSpaceSlug}` : '/chat';
  }, [firstSpaceSlug]);

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Card className="p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Mujarrad</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome. Choose where you want to start.
          </p>

          {isAuthenticated ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => router.push('/spaces')}>
                Open Spaces
              </Button>
              <Button
                variant="outline"
                disabled={isLoadingSpaces}
                onClick={() => router.push(chatHref)}
              >
                {isLoadingSpaces ? 'Preparing Chat...' : 'Open Chatbot'}
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button variant="outline" onClick={() => router.push('/register')}>
                Create Account
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
