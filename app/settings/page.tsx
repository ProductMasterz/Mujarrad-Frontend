'use client';

import { Key, Bell, Palette, Shield, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ApiKeyList } from '@/components/settings/ApiKeyList';
import { useNotificationStore } from '@/stores/notificationStore';

export default function SettingsPage() {
  const settings = useNotificationStore((state) => state.settings);
  const updateSettings = useNotificationStore((state) => state.updateSettings);
  const resetSettings = useNotificationStore((state) => state.resetSettings);
  const addNotification = useNotificationStore((state) => state.addNotification);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage application preferences, access, and integrations.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border bg-background p-3 shadow-sm">
              <div className="mb-2 px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categories
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">General</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl bg-muted px-3 py-3 text-left"
                >
                  <span className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">Notifications</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Appearance</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">API Keys</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">Notifications</h2>
                </div>

                <p className="mb-5 text-sm text-muted-foreground">
                  Control which notifications appear in Mujarrad.
                </p>

                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">Enable notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Turn all in-app notifications on or off
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => updateSettings({ enabled: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">Unread badge</div>
                        <div className="text-xs text-muted-foreground">
                          Show unread indicator on the bell icon
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showUnreadBadge}
                        onChange={(e) => updateSettings({ showUnreadBadge: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">Sound</div>
                        <div className="text-xs text-muted-foreground">
                          Play a sound when a new notification arrives
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.playSound}
                        onChange={(e) => updateSettings({ playSound: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Sources</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Chat activity</span>
                        <input
                          type="checkbox"
                          checked={settings.notifyChatActivity}
                          onChange={(e) =>
                            updateSettings({ notifyChatActivity: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Node changes</span>
                        <input
                          type="checkbox"
                          checked={settings.notifyNodeChanges}
                          onChange={(e) =>
                            updateSettings({ notifyNodeChanges: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Space changes</span>
                        <input
                          type="checkbox"
                          checked={settings.notifySpaceChanges}
                          onChange={(e) =>
                            updateSettings({ notifySpaceChanges: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Types</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Success</span>
                        <input
                          type="checkbox"
                          checked={settings.allowSuccess}
                          onChange={(e) => updateSettings({ allowSuccess: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Info</span>
                        <input
                          type="checkbox"
                          checked={settings.allowInfo}
                          onChange={(e) => updateSettings({ allowInfo: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Warning</span>
                        <input
                          type="checkbox"
                          checked={settings.allowWarning}
                          onChange={(e) => updateSettings({ allowWarning: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Error</span>
                        <input
                          type="checkbox"
                          checked={settings.allowError}
                          onChange={(e) => updateSettings({ allowError: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        addNotification({
                          type: 'info',
                          source: 'system',
                          title: 'Test notification',
                          description: 'Your notification settings are working.',
                        })
                      }
                      className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                    >
                      Send test notification
                    </button>

                    <button
                      type="button"
                      onClick={resetSettings}
                      className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                    >
                      Reset notification settings
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">API Keys</h2>
                </div>

                <p className="mb-5 text-sm text-muted-foreground">
                  Manage API keys for integrating your applications with Mujarrad.
                  Keys provide programmatic access to spaces and nodes.
                </p>

                <ApiKeyList />
              </section>

              <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <h2 className="text-base font-semibold text-foreground">Next settings blocks</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add appearance, security, and other app preferences here.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}