'use client';

import { User, Mail, Shield, CalendarDays, BadgeCheck, KeyRound } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/stores/notificationStore';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const displayName =
    user?.username?.trim() ||
    user?.email?.split('@')[0] ||
    'Mujarrad User';

  const initials =
    displayName
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'MU';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handlePlaceholderAction = (title: string) => {
    addNotification({
      type: 'info',
      source: 'system',
      title,
      description: 'This action is not connected to backend yet.',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background px-6 pb-10 pt-24 text-foreground">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your account identity and personal access details.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-xl font-semibold text-foreground">
                  {initials}
                </div>

                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.email || 'No email available'}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Authenticated account
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handlePlaceholderAction('Edit profile')}
                  className="w-full rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                >
                  Edit profile
                </button>

                <button
                  type="button"
                  onClick={() => handlePlaceholderAction('Change password')}
                  className="w-full rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                >
                  Change password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">Account details</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full name
                    </div>
                    <p className="text-sm text-muted-foreground">{displayName}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </div>
                    <p className="text-sm text-muted-foreground">{user?.email || 'No email available'}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Role
                    </div>
                    <p className="text-sm text-muted-foreground">Authenticated user</p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      Account status
                    </div>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">Security</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-foreground">Password</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Password change flow can be connected here later.
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-foreground">Sessions</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Session history and device management can be added later.
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="mb-2 text-base font-semibold text-foreground">Account note</div>
                <p className="text-sm text-muted-foreground">
                  Personal identity belongs here. Product-level behavior, notifications, and API controls belong in Settings.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}