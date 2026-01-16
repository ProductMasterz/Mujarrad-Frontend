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

export function NotificationsDropdown({ onClose, anchorEl }: NotificationsDropdownProps) {
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

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[312px] z-[100]"
      style={{
        left: `${rect.right - 312}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      {/* Header */}
      <div className="px-[17px] py-[15px] border-b border-[#f2f2f2]">
        <div className="flex items-center justify-between">
          <span
            className="font-['Roboto:Medium',sans-serif] font-medium text-[15px] text-black tracking-[-0.24px] leading-[24px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Notifications
          </span>
          <span
            className="font-['Roboto:Regular',sans-serif] font-normal text-[11px] text-[#bdbdbd] tracking-[-0.08px] leading-[16px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            (54)
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {mockNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`px-[17px] py-[12px] hover:bg-[#f5f5f5] transition-colors cursor-pointer ${
              index !== mockNotifications.length - 1 ? "border-b border-[#f2f2f2]" : ""
            }`}
          >
            <div className="flex gap-[12px]">
              <div
                className="size-[30px] rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: notification.userColor }}
              >
                <span
                  className="font-['Roboto:Medium',sans-serif] font-medium text-[12px] text-white tracking-[-0.08px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {notification.userInitials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#4f4f4f] tracking-[-0.08px] leading-[18px] mb-[4px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  <span className="font-['Roboto:Medium',sans-serif] font-medium">
                    {notification.userName}
                  </span>{" "}
                  {notification.message}
                </p>
                <span
                  className="font-['Roboto:Regular',sans-serif] font-normal text-[11px] text-[#bdbdbd] tracking-[-0.08px] leading-[16px]"
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
