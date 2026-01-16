import { useEffect, useRef, useState } from "react";
import { X, Link, ChevronDown, ChevronRight, MoreVertical, UserCircle, Square } from "lucide-react";
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
  const [linkPermission, setLinkPermission] = useState("can View");
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

  // Tree structure for "What can users view?"
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
      if (e.key === "Escape") {
        onClose();
      }
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

  const handleCopyLink = () => {
    const link = `https://example.com/share/${cardId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  const handleInvite = () => {
    if (emails.trim()) {
      // Parse comma-separated emails
      const emailList = emails.split(",").map((email) => email.trim()).filter((email) => email);

      // Add each email to invited people
      const newPeople: InvitedPerson[] = emailList.map((email) => ({
        id: Date.now().toString() + Math.random(),
        name: email.split("@")[0], // Use email prefix as name
        email: email,
        permission: permission,
      }));

      setInvitedPeople([...invitedPeople, ...newPeople]);
      setEmails("");
    }
  };

  const updatePersonPermission = (personId: string, newPermission: string) => {
    if (newPermission === "Remove") {
      setInvitedPeople(invitedPeople.filter((p) => p.id !== personId));
    } else {
      setInvitedPeople(
        invitedPeople.map((p) =>
          p.id === personId ? { ...p, permission: newPermission } : p
        )
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
          if (child) {
            child.checked = !child.checked;
          }
        }
      } else {
        const node = newTree.find((n) => n.id === nodeId);
        if (node) {
          node.expanded = !node.expanded;
        }
      }
      return newTree;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[200]">
      <div
        ref={modalRef}
        className="bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] w-[320px] p-[24px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-[24px]">
          <h2
            className="font-['Roboto:Medium',sans-serif] font-medium text-[16px] text-[#333] tracking-[-0.08px] leading-[24px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Invite People
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-[24px] text-[#828282] hover:text-[#333] transition-colors"
            aria-label="Close"
          >
            <X className="size-[16px]" />
          </button>
        </div>

        {/* Email Input */}
        <div className="mb-[16px]">
          <div className="flex gap-[8px]">
            <input
              type="text"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Email, Comma Separate"
              className="flex-1 h-[36px] px-[12px] py-[8px] bg-white border border-[#e0e0e0] rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] tracking-[-0.08px] leading-[18px] focus:outline-none focus:border-[#248bf2]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />
            <div className="relative">
              <button
                onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                className="h-[36px] px-[12px] py-[8px] bg-white border border-[#e0e0e0] rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] leading-[18px] flex items-center gap-[4px] hover:bg-[#f5f5f5] transition-colors whitespace-nowrap"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {permission}
                <ChevronDown className="size-[12px]" />
              </button>

              {/* Permission Dropdown */}
              {showPermissionDropdown && (
                <div className="absolute right-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] py-[4px] min-w-[120px] z-[210]">
                  {["Can View", "Can Edit", "Can Comment"].map((perm) => (
                    <button
                      key={perm}
                      onClick={() => {
                        setPermission(perm);
                        setShowPermissionDropdown(false);
                      }}
                      className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px]"
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

        {/* What can users view */}
        <div className="mb-[16px]">
          <p
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] mb-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            What can users view ?
          </p>
          <div className="relative">
            <button
              onClick={() => setShowContentDropdown(!showContentDropdown)}
              className="w-full h-[36px] px-[12px] py-[8px] bg-white border border-[#e0e0e0] rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] tracking-[-0.08px] leading-[18px] flex items-center justify-between hover:bg-[#f5f5f5] transition-colors"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {selectedContent}
              <ChevronDown className="size-[12px] text-[#828282]" />
            </button>

            {/* Content Dropdown with Tree */}
            {showContentDropdown && (
              <div className="absolute left-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] py-[8px] w-full z-[210] max-h-[240px] overflow-y-auto">
                {viewTree.map((node) => (
                  <div key={node.id}>
                    <button
                      onClick={() => toggleNode(node.id)}
                      className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px] flex items-center gap-[6px]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {node.children && node.children.length > 0 && (
                        <ChevronRight
                          className={`size-[12px] text-[#828282] transition-transform ${
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
                          if (foundNode) {
                            foundNode.checked = !foundNode.checked;
                          }
                          setViewTree(newTree);
                        }}
                        className="size-[14px] accent-[#ff9500]"
                      />
                      <span>{node.label}</span>
                    </button>

                    {/* Children */}
                    {node.expanded && node.children && (
                      <div className="pl-[28px]">
                        {node.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => toggleNode(child.id, node.id)}
                            className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px] flex items-center gap-[6px]"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            <input
                              type="checkbox"
                              checked={child.checked}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleNode(child.id, node.id);
                              }}
                              className="size-[14px] accent-[#ff9500]"
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

        {/* Invite Button */}
        <button
          onClick={handleInvite}
          disabled={!emails.trim()}
          className="w-full h-[36px] px-[16px] py-[8px] bg-[#e0e0e0] text-[#828282] rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] leading-[18px] hover:bg-[#d0d0d0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-[24px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Invite
        </button>

        {/* Invited People Section */}
        {invitedPeople.length > 0 && (
          <>
            <div className="mb-[16px]">
              <h3
                className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] leading-[18px] mb-[12px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Invited People
              </h3>

              {invitedPeople.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between mb-[12px]"
                >
                  {/* Person Info */}
                  <div className="flex items-center gap-[12px]">
                    <div className="size-[32px] rounded-full bg-[#e0e0e0] flex items-center justify-center">
                      <UserCircle className="size-[20px] text-[#828282]" />
                    </div>
                    <div>
                      <p
                        className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] tracking-[-0.08px] leading-[18px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {person.name}
                      </p>
                      <p
                        className="font-['Roboto:Regular',sans-serif] font-normal text-[11px] text-[#828282] tracking-[-0.08px] leading-[16px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {person.email}
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-[8px]">
                    {/* View Content Button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowPersonContentDropdown(
                            showPersonContentDropdown === person.id ? null : person.id
                          )
                        }
                        className="size-[24px] flex items-center justify-center text-[#248bf2] hover:bg-[#f5f5f5] rounded-[4px] transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect x="0.5" y="0.5" width="5" height="5" stroke="currentColor" fill="none" />
                          <rect x="8.5" y="0.5" width="5" height="5" stroke="currentColor" fill="none" />
                          <rect x="0.5" y="8.5" width="5" height="5" stroke="currentColor" fill="none" />
                          <rect x="8.5" y="8.5" width="5" height="5" stroke="currentColor" fill="none" />
                        </svg>
                      </button>

                      {/* Content Access Dropdown */}
                      {showPersonContentDropdown === person.id && (
                        <div className="absolute right-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] p-[12px] min-w-[200px] z-[220]">
                          <p
                            className="font-['Roboto:Medium',sans-serif] font-medium text-[12px] text-[#333] tracking-[-0.08px] leading-[16px] mb-[8px]"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            What can {person.name} view?
                          </p>
                          {viewTree.map((node) => (
                            <div key={node.id}>
                              <button
                                onClick={() => toggleNode(node.id)}
                                className="w-full px-[8px] py-[4px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px] flex items-center gap-[6px]"
                                style={{ fontVariationSettings: "'wdth' 100" }}
                              >
                                {node.children && node.children.length > 0 && (
                                  <ChevronRight
                                    className={`size-[10px] text-[#828282] transition-transform ${
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
                                    if (foundNode) {
                                      foundNode.checked = !foundNode.checked;
                                    }
                                    setViewTree(newTree);
                                  }}
                                  className="size-[12px] accent-[#ff9500]"
                                />
                                <span>{node.label}</span>
                              </button>

                              {/* Children */}
                              {node.expanded && node.children && (
                                <div className="pl-[20px]">
                                  {node.children.map((child) => (
                                    <button
                                      key={child.id}
                                      onClick={() => toggleNode(child.id, node.id)}
                                      className="w-full px-[8px] py-[4px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px] flex items-center gap-[6px]"
                                      style={{ fontVariationSettings: "'wdth' 100" }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={child.checked}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          toggleNode(child.id, node.id);
                                        }}
                                        className="size-[12px] accent-[#ff9500]"
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

                    {/* Permission Dropdown Button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowPersonPermissionDropdown(
                            showPersonPermissionDropdown === person.id ? null : person.id
                          )
                        }
                        className="size-[24px] flex items-center justify-center text-[#248bf2] hover:bg-[#f5f5f5] rounded-[4px] transition-colors"
                      >
                        <MoreVertical className="size-[14px]" />
                      </button>

                      {/* Permission Dropdown Menu */}
                      {showPersonPermissionDropdown === person.id && (
                        <div className="absolute right-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] py-[4px] min-w-[160px] z-[220]">
                          <p
                            className="px-[12px] py-[4px] font-['Roboto:Medium',sans-serif] font-medium text-[11px] text-[#828282] tracking-[-0.08px] leading-[16px]"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            {person.name}&apos;s authority
                          </p>
                          {["Can View", "Can Edit Content", "Have Full Access Edit"].map((perm) => (
                            <button
                              key={perm}
                              onClick={() => updatePersonPermission(person.id, perm)}
                              className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px] flex items-center gap-[8px]"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              <input
                                type="checkbox"
                                checked={person.permission === perm}
                                readOnly
                                className="size-[14px] accent-[#ff9500]"
                              />
                              {perm}
                            </button>
                          ))}
                          <div className="border-t border-[#f2f2f2] my-[4px]" />
                          <button
                            onClick={() => updatePersonPermission(person.id, "Remove")}
                            className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#f44336] hover:bg-[#ffebee] transition-colors tracking-[-0.08px]"
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
          </>
        )}

        {/* Divider */}
        <div className="border-t border-[#f2f2f2] mb-[16px]" />

        {/* Copy Link Section */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-[8px] mb-[12px] text-[#248bf2] hover:text-[#1a6bc4] transition-colors"
        >
          <Link className="size-[18px]" />
          <span
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] leading-[18px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Copy Link
          </span>
        </button>

        {/* Link Sharing Mode Toggle */}
        <div className="mb-[12px]">
          <div className="flex gap-[8px] mb-[8px]">
            <button
              onClick={() => setLinkSharingMode("anyone")}
              className={`flex-1 h-[32px] px-[12px] py-[6px] rounded-[6px] font-['Roboto:Regular',sans-serif] font-normal text-[12px] tracking-[-0.08px] leading-[18px] transition-colors ${
                linkSharingMode === "anyone"
                  ? "bg-[#248bf2] text-white"
                  : "bg-[#f5f5f5] text-[#828282] hover:bg-[#e0e0e0]"
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Anyone with link
            </button>
            <button
              onClick={() => setLinkSharingMode("restricted")}
              className={`flex-1 h-[32px] px-[12px] py-[6px] rounded-[6px] font-['Roboto:Regular',sans-serif] font-normal text-[12px] tracking-[-0.08px] leading-[18px] transition-colors ${
                linkSharingMode === "restricted"
                  ? "bg-[#248bf2] text-white"
                  : "bg-[#f5f5f5] text-[#828282] hover:bg-[#e0e0e0]"
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Restricted
            </button>
          </div>
        </div>

        {/* Link Permission - Only show if "Anyone with link" is selected */}
        {linkSharingMode === "anyone" && (
          <div className="flex items-center gap-[4px] mb-[4px]">
            <p
              className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Anyone of the link
            </p>
            <div className="relative">
              <button
                onClick={() => setShowLinkPermissionDropdown(!showLinkPermissionDropdown)}
                className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] leading-[18px] flex items-center gap-[4px] hover:text-[#1a6bc4] transition-colors"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {linkPermission}
                <ChevronDown className="size-[10px]" />
              </button>

              {/* Link Permission Dropdown */}
              {showLinkPermissionDropdown && (
                <div className="absolute left-0 top-[calc(100%+4px)] bg-white rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] py-[4px] min-w-[100px] z-[210]">
                  {["can View", "can Edit", "can Comment"].map((perm) => (
                    <button
                      key={perm}
                      onClick={() => {
                        setLinkPermission(perm);
                        setShowLinkPermissionDropdown(false);
                      }}
                      className="w-full px-[12px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] hover:bg-[#f5f5f5] transition-colors tracking-[-0.08px]"
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

        {/* Restricted Message - Only show if "Restricted" is selected */}
        {linkSharingMode === "restricted" && (
          <p
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] mb-[4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Only people with access can view
          </p>
        )}
      </div>
    </div>
  );
}
