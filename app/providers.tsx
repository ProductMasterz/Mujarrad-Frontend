'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState } from 'react';

// Use environment variable for Google Client ID (required for production)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // Consider data fresh for 30 seconds to reduce API calls
            gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (garbage collection time)
            refetchOnWindowFocus: false, // Disable refetch on window focus to reduce rate limiting
            refetchOnMount: 'always', // Only refetch if data is stale
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: 1,
          },
        },
      })
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
