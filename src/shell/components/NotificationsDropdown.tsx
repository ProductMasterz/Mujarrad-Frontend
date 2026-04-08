'use client';

import { useEffect, useRef } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';

type NotificationsDropdownProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function NotificationsDropdown({
  anchorEl,
  onClose,
}: NotificationsDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotificationStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const menuWidth = 360;
  const padding = 8;

  const menuLeft = Math.min(
    Math.max(padding, rect.right - menuWidth),
    window.innerWidth - menuWidth - padding
  );

  const menuTop = rect.bottom + 8;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-[360px] rounded-2xl border border-border bg-background shadow-2xl"
      style={{
        left: `${menuLeft}px`,
        top: `${menuTop}px`,
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-foreground">Notifications</div>
          <div className="text-xs text-muted-foreground">
            {notifications.length} item{notifications.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
            title="Mark all as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>

          <button
            onClick={clearNotifications}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            type="button"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {notifications.length === 0 ? (
          <div className="rounded-xl px-3 py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`mb-2 cursor-pointer rounded-xl border px-3 py-3 transition hover:bg-muted/40 ${
                item.read
                  ? 'border-border bg-background'
                  : 'border-primary/20 bg-primary/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(item.id);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}