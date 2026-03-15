'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { getAuthToken } from '@/services/api/client';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthBypassEnabled()) {
      setIsChecking(false);
      return;
    }

    // Check if token exists
    const token = getAuthToken();

    if (!token) {
      // No token, redirect to login
      if (pathname !== '/login') {
        localStorage.setItem('redirect_after_login', pathname);
      }
      router.push('/login');
    } else {
      // Token exists, allow access
      setIsChecking(false);
    }
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
