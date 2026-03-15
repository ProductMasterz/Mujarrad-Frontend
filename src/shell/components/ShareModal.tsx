import { useEffect, useRef, useState } from "react";
import {
  X,
  Link,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  UserCircle,
} from "lucide-react";
import { CardType } from "../data/projects";

type TreeNode = {
  id: string;
  label: string;
  checked: boolean;
  children?: TreeNode[];
  expanded?: boolean;
};

type InvitedPerson = {
  id: string;
  name: string;
  email: string;
  permission: string;
};

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  cardType: CardType;
};

export function ShareModal({ isOpen, onClose, cardId, cardType }: ShareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [emails, setEmails] = useState("");
  const [permission, setPermission] = useState("Can View");
  const [linkPermission, setLinkPermission] = useState("Can View");
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);
  const [showLinkPermissionDropdown, setShowLinkPermissionDropdown] = useState(false);
  const [showContentDropdown, setShowContentDropdown] = useState(false);
  const [selectedContent, setSelectedContent] = useState("Journey Context");
  const [linkSharingMode, setLinkSharingMode] = useState<"anyone" | "restricted">("anyone");
  const [invitedPeople, setInvitedPeople] = useState<InvitedPerson[]>([
    {
      id: "1",
      name: "Hager Ashraf",
      email: "hager@example.com",
      permission: "Can View",
    },
    {
      id: "2",
      name: "Hady Osama",
      email: "hady@example.com",
      permission: "Can View",
    },
  ]);
  const [showPersonPermissionDropdown, setShowPersonPermissionDropdown] = useState<string | null>(null);
  const [showPersonContentDropdown, setShowPersonContentDropdown] = useState<string | null>(null);

  const [viewTree, setViewTree] = useState<TreeNode[]>([
    {
      id: "user-story-map",
      label: "User Story Map",
      checked: false,
      expanded: false,
      children: [
        { id: "journeys", label: "Journeys", checked: true },
        { id: "scratchup-verse", label: "Scratchup-Verse...", checked: true },
        { id: "application-mod", label: "Application Mod...", checked: true },
        { id: "node", label: "Node", checked: true },
        { id: "node-information", label: "NodeInformation...", checked: true },
      ],
    },
    {
      id: "steps",
      label: "Steps",
      checked: false,
      expanded: false,
      children: [],
    },
    {
      id: "stories",
      label: "Stories",
      checked: false,
      expanded: false,
      children: [],
    },
  ]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    const link = `https://example.com/share/${cardId}`;
    await navigator.clipboard.writeText(link);
  };

  const handleInvite = () => {
    if (!emails.trim()) return;

    const emailList = emails
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    const newPeople: InvitedPerson[] = emailList.map((email) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: email.split("@")[0],
      email,
      permission,
    }));

    setInvitedPeople((prev) => [...prev, ...newPeople]);
    setEmails("");
  };

  const updatePersonPermission = (personId: string, newPermission: string) => {
    if (newPermission === "Remove") {
      setInvitedPeople((prev) => prev.filter((p) => p.id !== personId));
    } else {
      setInvitedPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, permission: newPermission } : p))
      );
    }
    setShowPersonPermissionDropdown(null);
  };

  const toggleNode = (nodeId: string, parentId?: string) => {
    setViewTree((prev) => {
      const newTree = [...prev];
      if (parentId) {
        const parent = newTree.find((n) => n.id === parentId);
        if (parent?.children) {
          const child = parent.children.find((c) => c.id === nodeId);
          if (child) child.checked = !child.checked;
        }
      } else {
        const node = newTree.find((n) => n.id === nodeId);
        if (node) node.expanded = !node.expanded;
      }
      return newTree;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30">
      <div
        ref={modalRef}
        className="w-[320px] rounded-[12px] border border-border bg-background p-[24px] text-foreground shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] dark:shadow-[0px_16px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-[24px] flex items-center justify-between">
          <h2
            className="font-['Roboto:Medium',sans-serif] text-[16px] font-medium leading-[24px] tracking-[-0.08px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Invite People
          </h2>
          <button
            onClick={onClose}
            className="flex size-[24px] items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-[16px]" />
          </button>
        </div>

        <div className="mb-[16px]">
          <div className="flex gap-[8px]">
            <input
              type="text"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Email, comma separated"
              className="h-[36px] flex-1 rounded-[8px] border border-border bg-background px-[12px] py-[8px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />

            <div className="relative">
              <button
                onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                className="flex h-[36px] items-center gap-[4px] whitespace-nowrap rounded-[8px] border border-border bg-background px-[12px] py-[8px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-primary transition-colors hover:bg-accent"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {permission}
                <ChevronDown className="size-[12px]" />
              </button>

              {showPermissionDropdown && (
                <div className="absolute right-0 top-[calc(100%+4px)] z-[210] min-w-[120px] rounded-[8px] border border-border bg-popover py-[4px] shadow-lg">
                  {["Can View", "Can Edit", "Can Comment"].map((perm) => (
                    <button
                      key={perm}
                      onClick={() => {
                        setPermission(perm);
                        setShowPermissionDropdown(false);
                      }}
                      className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {perm}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-[16px]">
          <p
            className="mb-[8px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-muted-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            What can users view?
          </p>
          <div className="relative">
            <button
              onClick={() => setShowContentDropdown(!showContentDropdown)}
              className="flex h-[36px] w-full items-center justify-between rounded-[8px] border border-border bg-background px-[12px] py-[8px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {selectedContent}
              <ChevronDown className="size-[12px] text-muted-foreground" />
            </button>

            {showContentDropdown && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-[210] max-h-[240px] w-full overflow-y-auto rounded-[8px] border border-border bg-popover py-[8px] shadow-lg">
                {viewTree.map((node) => (
                  <div key={node.id}>
                    <button
                      onClick={() => toggleNode(node.id)}
                      className="flex w-full items-center gap-[6px] px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {node.children && node.children.length > 0 && (
                        <ChevronRight
                          className={`size-[12px] text-muted-foreground transition-transform ${
                            node.expanded ? "rotate-90" : ""
                          }`}
                        />
                      )}
                      <input
                        type="checkbox"
                        checked={node.checked}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newTree = [...viewTree];
                          const foundNode = newTree.find((n) => n.id === node.id);
                          if (foundNode) foundNode.checked = !foundNode.checked;
                          setViewTree(newTree);
                        }}
                        className="size-[14px]"
                      />
                      <span>{node.label}</span>
                    </button>

                    {node.expanded && node.children && (
                      <div className="pl-[28px]">
                        {node.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => toggleNode(child.id, node.id)}
                            className="flex w-full items-center gap-[6px] px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            <input
                              type="checkbox"
                              checked={child.checked}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleNode(child.id, node.id);
                              }}
                              className="size-[14px]"
                            />
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleInvite}
          disabled={!emails.trim()}
          className="mb-[24px] h-[36px] w-full rounded-[8px] bg-secondary px-[16px] py-[8px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Invite
        </button>

        {invitedPeople.length > 0 && (
          <div className="mb-[16px]">
            <h3
              className="mb-[12px] font-['Roboto:Medium',sans-serif] text-[13px] font-medium leading-[18px] tracking-[-0.08px] text-foreground"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Invited People
            </h3>

            {invitedPeople.map((person) => (
              <div key={person.id} className="mb-[12px] flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <div className="flex size-[32px] items-center justify-center rounded-full bg-muted">
                    <UserCircle className="size-[20px] text-muted-foreground" />
                  </div>
                  <div>
                    <p
                      className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {person.name}
                    </p>
                    <p
                      className="font-['Roboto:Regular',sans-serif] text-[11px] font-normal leading-[16px] tracking-[-0.08px] text-muted-foreground"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {person.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-[8px]">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowPersonContentDropdown(
                          showPersonContentDropdown === person.id ? null : person.id
                        )
                      }
                      className="flex size-[24px] items-center justify-center rounded-[4px] text-primary transition-colors hover:bg-accent"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="0.5" y="0.5" width="5" height="5" stroke="currentColor" fill="none" />
                        <rect x="8.5" y="0.5" width="5" height="5" stroke="currentColor" fill="none" />
                        <rect x="0.5" y="8.5" width="5" height="5" stroke="currentColor" fill="none" />
                        <rect x="8.5" y="8.5" width="5" height="5" stroke="currentColor" fill="none" />
                      </svg>
                    </button>

                    {showPersonContentDropdown === person.id && (
                      <div className="absolute right-0 top-[calc(100%+4px)] z-[220] min-w-[200px] rounded-[8px] border border-border bg-popover p-[12px] shadow-lg">
                        <p
                          className="mb-[8px] font-['Roboto:Medium',sans-serif] text-[12px] font-medium leading-[16px] tracking-[-0.08px] text-foreground"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          What can {person.name} view?
                        </p>
                        {viewTree.map((node) => (
                          <div key={node.id}>
                            <button
                              onClick={() => toggleNode(node.id)}
                              className="flex w-full items-center gap-[6px] px-[8px] py-[4px] text-left font-['Roboto:Regular',sans-serif] text-[12px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              {node.children && node.children.length > 0 && (
                                <ChevronRight
                                  className={`size-[10px] text-muted-foreground transition-transform ${
                                    node.expanded ? "rotate-90" : ""
                                  }`}
                                />
                              )}
                              <input type="checkbox" checked={node.checked} readOnly className="size-[12px]" />
                              <span>{node.label}</span>
                            </button>

                            {node.expanded && node.children && (
                              <div className="pl-[20px]">
                                {node.children.map((child) => (
                                  <button
                                    key={child.id}
                                    className="flex w-full items-center gap-[6px] px-[8px] py-[4px] text-left font-['Roboto:Regular',sans-serif] text-[12px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                                    style={{ fontVariationSettings: "'wdth' 100" }}
                                  >
                                    <input type="checkbox" checked={child.checked} readOnly className="size-[12px]" />
                                    <span>{child.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowPersonPermissionDropdown(
                          showPersonPermissionDropdown === person.id ? null : person.id
                        )
                      }
                      className="flex size-[24px] items-center justify-center rounded-[4px] text-primary transition-colors hover:bg-accent"
                    >
                      <MoreVertical className="size-[14px]" />
                    </button>

                    {showPersonPermissionDropdown === person.id && (
                      <div className="absolute right-0 top-[calc(100%+4px)] z-[220] min-w-[160px] rounded-[8px] border border-border bg-popover py-[4px] shadow-lg">
                        <p
                          className="px-[12px] py-[4px] font-['Roboto:Medium',sans-serif] text-[11px] font-medium leading-[16px] tracking-[-0.08px] text-muted-foreground"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          {person.name}&apos;s authority
                        </p>
                        {["Can View", "Can Edit Content", "Have Full Access Edit"].map((perm) => (
                          <button
                            key={perm}
                            onClick={() => updatePersonPermission(person.id, perm)}
                            className="flex w-full items-center gap-[8px] px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            <input type="checkbox" checked={person.permission === perm} readOnly className="size-[14px]" />
                            {perm}
                          </button>
                        ))}
                        <div className="my-[4px] border-t border-border" />
                        <button
                          onClick={() => updatePersonPermission(person.id, "Remove")}
                          className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-destructive transition-colors hover:bg-accent"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-[16px] border-t border-border" />

        <button
          onClick={handleCopyLink}
          className="mb-[12px] flex items-center gap-[8px] text-primary transition-colors hover:text-primary/80"
        >
          <Link className="size-[18px]" />
          <span
            className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Copy Link
          </span>
        </button>

        <div className="mb-[12px]">
          <div className="mb-[8px] flex gap-[8px]">
            <button
              onClick={() => setLinkSharingMode("anyone")}
              className={`flex-1 rounded-[6px] px-[12px] py-[6px] font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[-0.08px] transition-colors ${
                linkSharingMode === "anyone"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Anyone with link
            </button>
            <button
              onClick={() => setLinkSharingMode("restricted")}
              className={`flex-1 rounded-[6px] px-[12px] py-[6px] font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[-0.08px] transition-colors ${
                linkSharingMode === "restricted"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Restricted
            </button>
          </div>
        </div>

        {linkSharingMode === "anyone" && (
          <div className="mb-[4px] flex items-center gap-[4px]">
            <p
              className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-muted-foreground"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Anyone with the link
            </p>
            <div className="relative">
              <button
                onClick={() => setShowLinkPermissionDropdown(!showLinkPermissionDropdown)}
                className="flex items-center gap-[4px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-primary transition-colors hover:text-primary/80"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {linkPermission}
                <ChevronDown className="size-[10px]" />
              </button>

              {showLinkPermissionDropdown && (
                <div className="absolute left-0 top-[calc(100%+4px)] z-[210] min-w-[100px] rounded-[8px] border border-border bg-popover py-[4px] shadow-lg">
                  {["Can View", "Can Edit", "Can Comment"].map((perm) => (
                    <button
                      key={perm}
                      onClick={() => {
                        setLinkPermission(perm);
                        setShowLinkPermissionDropdown(false);
                      }}
                      className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {perm}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {linkSharingMode === "restricted" && (
          <p
            className="mb-[4px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-muted-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Only people with access can view
          </p>
        )}
      </div>
    </div>
  );
}