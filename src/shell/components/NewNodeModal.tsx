'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Maximize2, ChevronDown, FolderPlus, FilePlus, Box } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nodeService } from "@/services/api/node.service";
import { spaceService } from "@/services/api/space.service";
import { nodeKeys } from "@/hooks/api/useNodes";
import { spaceKeys } from "@/hooks/api/useSpaces";
import { useDuplicateCheck, type DuplicateAction } from "@/hooks/api/useDuplicateCheck";
import { NodeType as BackendNodeType, type Node as NodeDTO } from "@/types/backend-dtos";
import { BlockEditor, BlockEditorRef } from "@/components/blocks/BlockEditor";
import { DuplicateNodeModal } from "@/components/nodes/DuplicateNodeModal";
import { useNavigationStore } from "@/stores/navigationStore";

// Entity types that can be created
export type EntityType = "space" | "node" | "context";

type SpaceItem = {
  id: string;
  name: string;
};

// Icons for each entity type
const ENTITY_ICONS: Record<EntityType, React.ReactNode> = {
  space: <FolderPlus className="size-4" />,
  node: <FilePlus className="size-4" />,
  context: <Box className="size-4" />,
};

const ENTITY_LABELS: Record<EntityType, string> = {
  space: "Space",
  node: "Node",
  context: "Context",
};

type NewNodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  spaceSlug?: string;
  spaceId?: string;
  currentPath?: string[];
  currentSpace?: string;
  spaces?: SpaceItem[];
  onAddSpace?: (spaceName: string) => void;
  onSpaceChange?: (spaceId: string) => void;
  parentPath?: string[];
  insertPosition?: number;
  /** Default entity type to pre-select when modal opens */
  defaultType?: EntityType;
  /** Available entity types based on current navigation scope */
  availableTypes?: EntityType[];
};

export function NewNodeModal({
  isOpen,
  onClose,
  spaceSlug,
  spaceId,
  currentPath = [],
  currentSpace = "",
  spaces = [],
  onAddSpace,
  onSpaceChange,
  parentPath,
  insertPosition,
  defaultType = "node",
  availableTypes,
}: NewNodeModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const blockEditorRef = useRef<BlockEditorRef>(null);

  // Get current scope from navigation store to determine available types
  const scope = useNavigationStore((state) => state.scope);

  // Determine available types based on scope if not explicitly provided
  const resolvedAvailableTypes = availableTypes ?? (
    scope === 'spaces'
      ? ['space', 'node', 'context'] as EntityType[]
      : ['node', 'context'] as EntityType[]
  );

  const [entityType, setEntityType] = useState<EntityType>(defaultType);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [createdEntityId, setCreatedEntityId] = useState<string | null>(null);
  const [createdEntitySlug, setCreatedEntitySlug] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Duplicate detection state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateNode, setDuplicateNode] = useState<NodeDTO | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string>("");

  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Duplicate check hook
  const { checkDuplicate, generateUniqueTitle } = useDuplicateCheck({
    spaceSlug: spaceSlug || "",
  });

  // Check if we're creating a space (no block editor needed)
  const isSpaceMode = entityType === "space";

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: async (data: { title: string; nodeType: BackendNodeType }) => {
      if (!spaceSlug) throw new Error("spaceSlug is required for node creation");
      return nodeService.createNode(spaceSlug, {
        title: data.title || "Untitled",
        nodeType: data.nodeType,
        content: "",
      });
    },
    onSuccess: (node) => {
      setCreatedEntityId(node.id);
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    },
  });

  // Create space mutation
  const createSpaceMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return spaceService.createSpace({
        name: data.name || "Untitled",
      });
    },
    onSuccess: (space) => {
      setCreatedEntityId(space.id);
      setCreatedEntitySlug(space.slug);
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Set default type when modal opens
      setEntityType(defaultType);
    } else {
      // Reset everything when modal closes
      setTitle("");
      setCreatedEntityId(null);
      setCreatedEntitySlug(null);
      setEntityType(defaultType);
      setIsCreating(false);
      setShowDuplicateModal(false);
      setDuplicateNode(null);
      setPendingTitle("");
    }
  }, [isOpen, defaultType]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create entity when user starts typing (if not already created)
  const ensureEntityCreated = useCallback(async (overrideTitle?: string) => {
    if (createdEntityId || isCreating) return createdEntityId;

    const titleToUse = overrideTitle || title || "Untitled";

    setIsCreating(true);
    try {
      if (entityType === "space") {
        // Create space
        const space = await createSpaceMutation.mutateAsync({
          name: titleToUse,
        });
        return space.id;
      } else {
        // Create node or context
        const backendType = entityType === "context" ? BackendNodeType.CONTEXT : BackendNodeType.REGULAR;
        const node = await createNodeMutation.mutateAsync({
          title: titleToUse,
          nodeType: backendType,
        });
        return node.id;
      }
    } catch (error) {
      console.error(`Failed to create ${entityType}:`, error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [createdEntityId, isCreating, entityType, title, createNodeMutation, createSpaceMutation]);

  // Handle duplicate action from modal
  const handleDuplicateAction = useCallback(async (action: DuplicateAction, renamedTitle?: string) => {
    setShowDuplicateModal(false);

    switch (action) {
      case 'merge':
        // Navigate to existing node
        if (duplicateNode && spaceSlug) {
          onClose();
          router.push(`/spaces/${spaceSlug}/node/${duplicateNode.id}`);
        }
        break;

      case 'create-anyway':
        // Create with the duplicate title
        setTitle(pendingTitle);
        await ensureEntityCreated(pendingTitle);
        break;

      case 'rename':
        // Create with the new title
        if (renamedTitle) {
          setTitle(renamedTitle);
          await ensureEntityCreated(renamedTitle);
        }
        break;

      case 'cancel':
        // Just close the duplicate modal, keep the main modal open
        setPendingTitle("");
        break;
    }

    setDuplicateNode(null);
    setPendingTitle("");
  }, [duplicateNode, spaceSlug, onClose, router, pendingTitle, ensureEntityCreated]);

  // Handle title change - create entity on first keystroke (with duplicate check)
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // For spaces, we don't create on first keystroke - wait for submission
    if (isSpaceMode) {
      return;
    }

    // Create node/context on first character if not created
    if (!createdEntityId && newTitle.length === 1) {
      // Check for duplicates before creating
      const duplicateResult = checkDuplicate(newTitle);
      if (duplicateResult.isDuplicate && duplicateResult.existingNode) {
        // Show duplicate modal
        setDuplicateNode(duplicateResult.existingNode);
        setPendingTitle(newTitle);
        setShowDuplicateModal(true);
        return; // Don't create yet - wait for user decision
      }

      await ensureEntityCreated();
    }

    // Update title if node exists
    if (createdEntityId && newTitle && spaceSlug) {
      nodeService.updateNode(spaceSlug, createdEntityId, { title: newTitle }).catch(console.error);
    }
  };

  // Check for duplicates when title loses focus (for longer titles typed quickly)
  const handleTitleBlur = async () => {
    if (isSpaceMode || createdEntityId || !title.trim()) {
      return;
    }

    const duplicateResult = checkDuplicate(title);
    if (duplicateResult.isDuplicate && duplicateResult.existingNode) {
      setDuplicateNode(duplicateResult.existingNode);
      setPendingTitle(title);
      setShowDuplicateModal(true);
    }
  };

  // Handle expand to full page (or create and navigate for spaces)
  const handleExpand = async () => {
    if (isSpaceMode) {
      // Create space and navigate to it
      try {
        const space = await createSpaceMutation.mutateAsync({
          name: title || "Untitled",
        });
        onClose();
        router.push(`/spaces/${space.slug}`);
      } catch (error) {
        console.error("Failed to create space:", error);
      }
      return;
    }

    // For nodes/contexts
    let entityId = createdEntityId;

    // Create entity if not exists
    if (!entityId) {
      entityId = await ensureEntityCreated();
    }

    if (entityId && spaceSlug) {
      onClose();
      router.push(`/spaces/${spaceSlug}/node/${entityId}`);
    }
  };

  // Handle close - save and close
  const handleClose = async () => {
    // Save any pending content before closing (only for nodes/contexts)
    if (!isSpaceMode && blockEditorRef.current) {
      await blockEditorRef.current.saveNow();
    }
    if (createdEntityId) {
      if (isSpaceMode) {
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
      } else {
        queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
      }
    }
    onClose();
  };

  // Handle create button click (for spaces, which don't auto-create)
  const handleCreate = async () => {
    if (isSpaceMode) {
      try {
        const space = await createSpaceMutation.mutateAsync({
          name: title || "Untitled",
        });
        onClose();
        router.push(`/spaces/${space.slug}`);
      } catch (error) {
        console.error("Failed to create space:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(41,41,41,0.5)]" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white w-[1100px] h-[729px] rounded-[37px] shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-[24px] pt-[19px] pb-[12px]">
          <div className="flex items-center gap-[12px]">
            {/* Expand button */}
            <button
              onClick={handleExpand}
              className="size-6 flex items-center justify-center text-[#828282] hover:text-[#333] transition-colors"
              title="Open in full page"
            >
              <Maximize2 className="size-5" strokeWidth={1.5} />
            </button>

            {/* Entity Type Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="bg-[#e4f1ff] h-[32px] px-[12px] rounded-[100px] flex items-center gap-[8px] hover:bg-[#d5e8ff] transition-colors"
              >
                <span className="text-[#248bf2]">{ENTITY_ICONS[entityType]}</span>
                <span
                  className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {ENTITY_LABELS[entityType]}
                </span>
                <ChevronDown className="size-4 text-[#248bf2]" strokeWidth={1.5} />
              </button>

              {/* Type Dropdown Menu */}
              {showTypeDropdown && (
                <div className="absolute left-0 top-[38px] bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[188px] py-[12px] px-[12px] z-10">
                  {resolvedAvailableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setEntityType(type);
                        setShowTypeDropdown(false);
                      }}
                      className={clsx(
                        "w-full text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] py-[6px] px-[8px] rounded-[6px] flex items-center gap-[8px] transition-colors",
                        entityType === type
                          ? "text-[#248bf2] bg-[#e4f1ff]"
                          : "text-[#828282] hover:text-[#333] hover:bg-[#f5f5f5]"
                      )}
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      <span className={entityType === type ? "text-[#248bf2]" : "text-[#828282]"}>
                        {ENTITY_ICONS[type]}
                      </span>
                      {ENTITY_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-[#828282] hover:text-[#333] transition-colors"
          >
            <X className="size-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-[67px] py-[24px]">
          {/* Title Input */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              // For spaces, create on Enter
              if (e.key === "Enter" && isSpaceMode) {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="Untitled"
            className="w-full text-[32px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] mb-2 outline-none border-none bg-transparent placeholder:text-[#bdbdbd]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />

          {isSpaceMode ? (
            // Space mode - simple form with description and create button
            <>
              <p
                className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#bdbdbd] tracking-[-0.08px] leading-[18px] mb-[24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Enter a name for your new space
              </p>

              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center mb-[24px]">
                  <div className="size-16 mx-auto mb-4 rounded-[16px] bg-[#e4f1ff] flex items-center justify-center">
                    <FolderPlus className="size-8 text-[#248bf2]" />
                  </div>
                  <p
                    className="font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#828282] tracking-[-0.08px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    A space is a container for your nodes and contexts
                  </p>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={createSpaceMutation.isPending}
                  className="h-[40px] px-[24px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {createSpaceMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="size-4" />
                      Create Space
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            // Node/Context mode - block editor
            <>
              <p
                className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#bdbdbd] tracking-[-0.08px] leading-[18px] mb-[24px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Press &apos;/&apos; for commands
              </p>

              {/* Block Editor - only show if node is created */}
              {createdEntityId && spaceSlug && spaceId ? (
                <BlockEditor
                  ref={blockEditorRef}
                  pageId={createdEntityId}
                  spaceSlug={spaceSlug}
                  spaceId={spaceId}
                />
              ) : (
                <div
                  className="min-h-[200px] text-[#9ca3af] cursor-text"
                  onClick={async () => {
                    const entityId = await ensureEntityCreated();
                    if (entityId) {
                      // Focus will be handled by BlockEditor
                    }
                  }}
                >
                  <p className="text-[15px]">Click here or start typing a title to begin editing...</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status bar - only for nodes/contexts */}
        {!isSpaceMode && createdEntityId && (
          <div className="px-[24px] py-[12px] border-t border-[#f2f2f2] flex items-center justify-between">
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#bdbdbd] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Auto-saved
            </span>
            <button
              onClick={handleExpand}
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#248bf2] tracking-[-0.08px] hover:underline"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Open full page →
            </button>
          </div>
        )}
      </div>

      {/* Duplicate Node Modal */}
      {duplicateNode && (
        <DuplicateNodeModal
          open={showDuplicateModal}
          onOpenChange={setShowDuplicateModal}
          existingNode={duplicateNode}
          newTitle={pendingTitle}
          suggestedTitle={generateUniqueTitle(pendingTitle)}
          onAction={handleDuplicateAction}
        />
      )}
    </div>
  );
}
