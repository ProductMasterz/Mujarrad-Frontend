'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">Help</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Documentation, support, and help resources will appear here.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}