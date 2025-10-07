'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useWorkspace } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { CreateNodeDialog } from '@/components/nodes/CreateNodeDialog';
import { NodeList } from '@/components/nodes/NodeList';

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: workspace, isLoading, error } = useWorkspace(slug);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !workspace) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Workspace not found</h1>
            <p className="text-gray-600 mb-4">The workspace you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/workspaces')}>Back to Workspaces</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/workspaces')}
                  className="text-gray-600"
                >
                  ← Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
                  {workspace.description && (
                    <p className="text-sm text-gray-600 mt-1">{workspace.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreateNodeDialog workspaceSlug={slug} />
                <Button
                  variant="outline"
                  onClick={() => router.push(`/workspaces/${slug}/settings`)}
                >
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Node List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Nodes</h2>
                  <CreateNodeDialog workspaceSlug={slug} />
                </div>
                <NodeList workspaceSlug={slug} />
              </div>
            </div>

            {/* Sidebar - Workspace Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Workspace Info</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Slug</dt>
                    <dd className="font-mono text-gray-900">{workspace.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-900">
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Last Updated</dt>
                    <dd className="text-gray-900">
                      {new Date(workspace.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
