'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function hasSystemBuilderAuthSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = window.localStorage.getItem('auth_token');
  const authStorage = window.localStorage.getItem('auth-storage');

  if (!token || !authStorage) {
    return false;
  }

  try {
    const parsed = JSON.parse(authStorage) as {
      state?: {
        user?: unknown;
      };
    };

    return !!parsed.state?.user;
  } catch {
    return false;
  }
}

export function SystemBuilderAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!hasSystemBuilderAuthSession()) {
      window.localStorage.setItem('redirect_after_login', pathname);
      router.replace('/login');
      return;
    }

    setIsAllowed(true);
  }, [pathname, router]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
