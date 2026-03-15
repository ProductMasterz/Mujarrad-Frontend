import { useEffect, useRef } from "react";

type Notification = {
  id: string;
  userName: string;
  userInitials: string;
  userColor: string;
  message: string;
  timestamp: string;
};

type NotificationsDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    userName: "Hager Ashraf",
    userInitials: "HA",
    userColor: "#6ab5ff",
    message: 'added a new information (node type) to the user story map',
    timestamp: "23/11/2023, 03:13pm",
  },
  {
    id: "2",
    userName: "Mustafa Dabah",
    userInitials: "MD",
    userColor: "#6ab5ff",
    message: 'create a new version for the node " Front end - improvement"',
    timestamp: "23/11/2023, 03:13pm",
  },
  {
    id: "3",
    userName: "Hager Ashraf",
    userInitials: "HA",
    userColor: "#6ab5ff",
    message: 'added a new node " Design the registeration flow "',
    timestamp: "23/11/2023, 03:13pm",
  },
  {
    id: "4",
    userName: "Mustafa Dabah",
    userInitials: "MD",
    userColor: "#6ab5ff",
    message: 'create a new version for the node " Front end - improvement"',
    timestamp: "23/11/2023, 03:13pm",
  },
];

export function NotificationsDropdown({
  onClose,
  anchorEl,
}: NotificationsDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, anchorEl]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const menuWidth = 312;
  const padding = 8;
  const left = Math.min(
    Math.max(padding, rect.right - menuWidth),
    window.innerWidth - menuWidth - padding
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-[312px] rounded-[12px] border border-border bg-background text-foreground shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_14px_34px_rgba(0,0,0,0.35)]"
      style={{
        left: `${left}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      <div className="border-b border-border px-[17px] py-[15px]">
        <div className="flex items-center justify-between">
          <span
            className="font-['Roboto:Medium',sans-serif] text-[15px] font-medium leading-[24px] tracking-[-0.24px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Notifications
          </span>
          <span
            className="font-['Roboto:Regular',sans-serif] text-[11px] font-normal leading-[16px] tracking-[-0.08px] text-muted-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            (54)
          </span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {mockNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`cursor-pointer px-[17px] py-[12px] transition-colors hover:bg-accent ${
              index !== mockNotifications.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex gap-[12px]">
              <div
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: notification.userColor }}
              >
                <span
                  className="font-['Roboto:Medium',sans-serif] text-[12px] font-medium tracking-[-0.08px] text-white"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {notification.userInitials}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="mb-[4px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  <span className="font-['Roboto:Medium',sans-serif] font-medium">
                    {notification.userName}
                  </span>{" "}
                  <span className="text-muted-foreground">{notification.message}</span>
                </p>

                <span
                  className="font-['Roboto:Regular',sans-serif] text-[11px] font-normal leading-[16px] tracking-[-0.08px] text-muted-foreground"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {notification.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}