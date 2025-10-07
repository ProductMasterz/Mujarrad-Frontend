'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores';
import { useLogout } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function WorkspacesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { mutate: logout } = useLogout();

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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Workspaces</h2>
            <p className="text-gray-600 mb-6">
              Your workspaces will appear here. This is where you can manage your knowledge graphs.
            </p>
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
                <p className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</p>
                <p className="text-sm text-gray-500">
                  Get started by creating your first workspace
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
