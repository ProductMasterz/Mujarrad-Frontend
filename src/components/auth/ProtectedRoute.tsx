'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { useCurrentUser } from '@/hooks/api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      // Save current path for redirect after login
      if (pathname !== '/login') {
        localStorage.setItem('redirect_after_login', pathname);
      }
      router.push('/login');
    }
  }, [isPending, isAuthenticated, router, pathname]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
