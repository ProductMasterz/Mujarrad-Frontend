'use client';

import { useState } from 'react';
import { Key, Bell, Palette, Shield, ChevronRight, Monitor, Globe, LayoutGrid, MessageSquare, GitBranch } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ApiKeyList } from '@/components/settings/ApiKeyList';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAppPreferencesStore } from '@/stores';

type SettingsTab = 'general' | 'notifications' | 'appearance' | 'api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const { theme, setTheme } = useTheme();

  const settings = useNotificationStore((state) => state.settings);
  const updateSettings = useNotificationStore((state) => state.updateSettings);
  const resetSettings = useNotificationStore((state) => state.resetSettings);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const preferences = useAppPreferencesStore((state) => state.preferences);
  const updatePreferences = useAppPreferencesStore((state) => state.updatePreferences);
  const resetPreferences = useAppPreferencesStore((state) => state.resetPreferences);

  const sendTestNotification = () => {
    addNotification({
      type: 'info',
      source: 'system',
      title: 'Test notification',
      description: 'Your notification settings are working.',
    });
  };

  const resetAllLocalSettings = () => {
    resetSettings();
    resetPreferences();
    addNotification({
      type: 'success',
      source: 'system',
      title: 'Settings reset',
      description: 'Local app preferences were reset to defaults.',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background px-6 pb-10 pt-24 text-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage application preferences, experience, and integrations.
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
                  onClick={() => setActiveTab('general')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${activeTab === 'general' ? 'bg-muted' : 'hover:bg-muted'}`}
                >
                  <span className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">General</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${activeTab === 'notifications' ? 'bg-muted' : 'hover:bg-muted'}`}
                >
                  <span className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Notifications</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('appearance')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${activeTab === 'appearance' ? 'bg-muted' : 'hover:bg-muted'}`}
                >
                  <span className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Appearance</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('api')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${activeTab === 'api' ? 'bg-muted' : 'hover:bg-muted'}`}
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
              {activeTab === 'general' && (
                <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold text-foreground">General</h2>
                  </div>

                  <p className="mb-5 text-sm text-muted-foreground">
                    Configure core application behavior and defaults.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          updatePreferences({ language: e.target.value as 'en' | 'ar' | 'de' })
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        Default landing page
                      </label>
                      <select
                        value={preferences.defaultHomePage}
                        onChange={(e) =>
                          updatePreferences({
                            defaultHomePage: e.target.value as 'home' | 'spaces' | 'settings' | 'profile',
                          })
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="home">Home</option>
                        <option value="spaces">Spaces</option>
                        <option value="settings">Settings</option>
                        <option value="profile">Profile</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Time format
                      </label>
                      <select
                        value={preferences.timeFormat}
                        onChange={(e) =>
                          updatePreferences({ timeFormat: e.target.value as '12h' | '24h' })
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="24h">24-hour</option>
                        <option value="12h">12-hour</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        UI density
                      </label>
                      <select
                        value={preferences.uiDensity}
                        onChange={(e) =>
                          updatePreferences({ uiDensity: e.target.value as 'comfortable' | 'compact' })
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="comfortable">Comfortable</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Interaction</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Reduce motion</span>
                        <input
                          type="checkbox"
                          checked={preferences.reduceMotion}
                          onChange={(e) => updatePreferences({ reduceMotion: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Open chat history by default</span>
                        <input
                          type="checkbox"
                          checked={preferences.openChatHistoryByDefault}
                          onChange={(e) =>
                            updatePreferences({ openChatHistoryByDefault: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Send message on Enter</span>
                        <input
                          type="checkbox"
                          checked={preferences.sendMessageOnEnter}
                          onChange={(e) =>
                            updatePreferences({ sendMessageOnEnter: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Show chat timestamps</span>
                        <input
                          type="checkbox"
                          checked={preferences.showChatTimestamps}
                          onChange={(e) =>
                            updatePreferences({ showChatTimestamps: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Graph / knowledge view</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Render markdown in graph details</span>
                        <input
                          type="checkbox"
                          checked={preferences.renderMarkdownInGraph}
                          onChange={(e) =>
                            updatePreferences({ renderMarkdownInGraph: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <span className="text-sm text-foreground">Show technical details by default</span>
                        <input
                          type="checkbox"
                          checked={preferences.showTechnicalDetailsByDefault}
                          onChange={(e) =>
                            updatePreferences({ showTechnicalDetailsByDefault: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                      </label>

                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetAllLocalSettings}
                      className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                    >
                      Reset all local settings
                    </button>
                  </div>
                </section>
              )}

              {activeTab === 'notifications' && (
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
                          <div className="text-xs text-muted-foreground">Turn all in-app notifications on or off</div>
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
                          <div className="text-xs text-muted-foreground">Show unread indicator on the bell icon</div>
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
                          <div className="text-xs text-muted-foreground">Play a sound when a new notification arrives</div>
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
                            onChange={(e) => updateSettings({ notifyChatActivity: e.target.checked })}
                            className="h-4 w-4"
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                          <span className="text-sm text-foreground">Node changes</span>
                          <input
                            type="checkbox"
                            checked={settings.notifyNodeChanges}
                            onChange={(e) => updateSettings({ notifyNodeChanges: e.target.checked })}
                            className="h-4 w-4"
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                          <span className="text-sm text-foreground">Space changes</span>
                          <input
                            type="checkbox"
                            checked={settings.notifySpaceChanges}
                            onChange={(e) => updateSettings({ notifySpaceChanges: e.target.checked })}
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
                          <input type="checkbox" checked={settings.allowSuccess} onChange={(e) => updateSettings({ allowSuccess: e.target.checked })} className="h-4 w-4" />
                        </label>

                        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                          <span className="text-sm text-foreground">Info</span>
                          <input type="checkbox" checked={settings.allowInfo} onChange={(e) => updateSettings({ allowInfo: e.target.checked })} className="h-4 w-4" />
                        </label>

                        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                          <span className="text-sm text-foreground">Warning</span>
                          <input type="checkbox" checked={settings.allowWarning} onChange={(e) => updateSettings({ allowWarning: e.target.checked })} className="h-4 w-4" />
                        </label>

                        <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                          <span className="text-sm text-foreground">Error</span>
                          <input type="checkbox" checked={settings.allowError} onChange={(e) => updateSettings({ allowError: e.target.checked })} className="h-4 w-4" />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={sendTestNotification}
                        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                      >
                        Send test notification
                      </button>

                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                      >
                        Clear notification history
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
              )}

              {activeTab === 'appearance' && (
                <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold text-foreground">Appearance</h2>
                  </div>

                  <p className="mb-5 text-sm text-muted-foreground">
                    Manage theme and interface presentation.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        Theme
                      </label>
                      <select
                        value={theme || 'system'}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Density
                      </label>
                      <select
                        value={preferences.uiDensity}
                        onChange={(e) =>
                          updatePreferences({ uiDensity: e.target.value as 'comfortable' | 'compact' })
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="comfortable">Comfortable</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    Later, this section can also control accent color, typography scale, sidebar density, and reduced visual effects.
                  </div>
                </section>
              )}

              {activeTab === 'api' && (
                <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold text-foreground">API Keys</h2>
                  </div>

                  <p className="mb-5 text-sm text-muted-foreground">
                    Manage API keys for integrating your applications with Mujarrad.
                  </p>

                  <ApiKeyList />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}