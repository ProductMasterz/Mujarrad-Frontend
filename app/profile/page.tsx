'use client';

import { User, Mail, Shield, CalendarDays } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your personal account information.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background shadow-sm">
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground">
                  <User className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {user?.name || 'Mujarrad User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Personal account overview
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'No email available'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Role
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.role || 'Standard user'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 md:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  Account
                </div>
                <p className="text-sm text-muted-foreground">
                  This page is for personal profile information only. App-level controls live in Settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}