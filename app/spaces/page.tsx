'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores';
import { useLogout } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CreateSpaceDialog } from '@/components/spaces/CreateSpaceDialog';
import { SpaceCard } from '@/components/spaces/SpaceCard';
import { spaceService } from '@/services/api';
import type { Space } from '@/types/backend-dtos';

export default function SpacesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { mutate: logout } = useLogout();

  // Direct API call instead of React Query
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('[SpacesPage] useEffect running, fetching spaces...');
    spaceService.getSpaces()
      .then((data) => {
        console.log('[SpacesPage] Spaces fetched:', data);
        // Backend returns plain array, not PaginatedResponse
        setSpaces(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[SpacesPage] Error fetching spaces:', err);
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push('/login');
      },
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mujarrad</h1>
              <p className="text-sm text-gray-600">Knowledge Graph Management</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.username}</span>
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Spaces</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your knowledge graphs and collaborate with others
                </p>
              </div>
              <CreateSpaceDialog />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="border-2 border-red-300 rounded-lg p-12 text-center bg-red-50">
                <div className="text-red-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-red-900 mb-2">Error loading spaces</p>
                  <p className="text-sm text-red-600">
                    {error.message || 'An unknown error occurred'}
                  </p>
                </div>
              </div>
            ) : spaces.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">No spaces yet</p>
                  <p className="text-sm text-gray-500">
                    Get started by clicking the &quot;Create Space&quot; button above
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spaces.map((space) => (
                  <SpaceCard key={space.id} space={space} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
