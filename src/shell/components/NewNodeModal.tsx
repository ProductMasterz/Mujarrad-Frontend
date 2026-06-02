'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { X, Maximize2, ChevronDown, FolderPlus, FilePlus, Box, Tag, Sparkles, LayoutTemplate } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nodeService } from "@/services/api/node.service";
import { spaceService } from "@/services/api/space.service";
import { nodeKeys } from "@/hooks/api/useNodes";
import { spaceKeys } from "@/hooks/api/useSpaces";
import { useDuplicateCheck, type DuplicateAction } from "@/hooks/api/useDuplicateCheck";
import { NodeType as BackendNodeType, type Node as NodeDTO } from "@/types/backend-dtos";
import { DuplicateNodeModal } from "@/components/nodes/DuplicateNodeModal";
import { useNavigationStore } from "@/stores/navigationStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useEntityTypeStore } from "@/stores/entityType.store";
import { NodeTemplateModal } from "@/components/templates/NodeTemplateModal";
import type { NodeTemplate } from "@/components/templates/nodeTemplates";
import { createTemplateBlocks } from "@/components/templates/templateBlockService";

// Entity types that can be created
export type EntityType = "space" | "node" | "context";

type ManualSystemNodeType = "REGULAR" | "CONTEXT" | "ATTRIBUTE";
type ManualEntityType = string;

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



const MANUAL_SYSTEM_NODE_TYPE_OPTIONS: Array<{
  value: ManualSystemNodeType;
  label: string;
}> = [
  { value: "REGULAR", label: "Regular" },
  { value: "CONTEXT", label: "Context" },
  { value: "ATTRIBUTE", label: "Attribute" },
];

type NewNodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  spaceSlug?: string;
  defaultType?: EntityType;
  availableTypes?: EntityType[];

  // Optional: used when opening the modal from inside a context page.
  // If provided, new regular nodes are created directly inside this context.
  defaultContextSlug?: string;

  // Optional: hides the context selector UI when we already know the target context.
  hideContextSelector?: boolean;
};




export function NewNodeModal({
  isOpen,
  onClose,
  spaceSlug,
  defaultType = "node",
  availableTypes,
  defaultContextSlug,
  hideContextSelector = false,
}: NewNodeModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const addNotification = useNotificationStore((state) => state.addNotification);
  // Get current scope from navigation store to determine available types
  const entityTypeMap = useEntityTypeStore((state) => state.types);
  const getEntityType = useEntityTypeStore((state) => state.getType);
  const upsertEntityType = useEntityTypeStore((state) => state.upsertType);

  const scope = useNavigationStore((state) => state.scope);

  // Determine available types based on scope if not explicitly provided
  const resolvedAvailableTypes = availableTypes ?? (
    scope === 'spaces'
      ? ['space', 'node', 'context'] as EntityType[]
      : ['node', 'context'] as EntityType[]
  );

  
  const entityTypeOptions = useMemo(() => {
    return Object.values(entityTypeMap).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [entityTypeMap]);

  const [entityType, setEntityType] = useState<EntityType>(defaultType);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [manualEntityType, setManualEntityType] = useState<ManualEntityType>("");
  const [manualEntityColor, setManualEntityColor] = useState("#94a3b8");
  const [manualContextColor, setManualContextColor] = useState("#9333ea");
  const [manualSystemNodeType, setManualSystemNodeType] =
  useState<ManualSystemNodeType>(
    defaultType === "context" ? "CONTEXT" : "REGULAR"
  );
  const [createdFrom] = useState<"manual">("manual");
  const [createdEntityId, setCreatedEntityId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NodeTemplate | null>(null);
  const [selectedContextSlug, setSelectedContextSlug] = useState("");
  const [newContextTitle, setNewContextTitle] = useState("");
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


  const { data: availableContexts = [] } = useQuery({
    queryKey: ["new-node-modal", "contexts", spaceSlug],
    queryFn: async () => {
      if (!spaceSlug) return [];

      const nodes = await nodeService.getNodes(spaceSlug, { page: 0, size: 1000 });

      return nodes.filter((node) => {
        if (node.nodeType !== BackendNodeType.CONTEXT) return false;
        if (node.isBuiltin) return false;

        const details =
          typeof node.nodeDetails === "string"
            ? (() => {
                try {
                  return JSON.parse(node.nodeDetails);
                } catch {
                  return undefined;
                }
              })()
            : node.nodeDetails;

        if (details?.showInSpaceList === false) return false;
        if (details?.systemContext === "chat") return false;
        if (details?.chatNodeType) return false;

        return true;
      });
    },
    enabled: !!spaceSlug && isOpen && !isSpaceMode,
  });


  // Create node mutation
    const createNodeMutation = useMutation({
      mutationFn: async (data: {
        title: string;
        nodeType: BackendNodeType;
        content: string;
        entityType?: string;
        contextColor?: string;
        createdFrom: "manual";
        contextSlug?: string;
      }) => {
        if (!spaceSlug) {
          // No space selected — create in The Void
          const { voidService } = await import("@/services/api/void.service");
          return voidService.createVoidNode({
            title: data.title || "Untitled",
            content: data.content || "",
            nodeDetails: {
              createdFrom: data.createdFrom,
              ...(data.entityType ? { entityType: data.entityType } : {}),
            },
          });
        }

        const payload = {
          title: data.title || "Untitled",
          nodeType: data.nodeType,
          content: data.content || "",
          nodeDetails: {
            createdFrom: data.createdFrom,
            ...(data.entityType ? { entityType: data.entityType } : {}),
            ...(data.contextColor ? { contextColor: data.contextColor } : {}),
            ...(data.contextSlug ? { contextSlug: data.contextSlug } : {}),
          },
        };

        if (data.contextSlug) {
          return nodeService.createNodeInContext(spaceSlug, data.contextSlug, payload);
        }

        return nodeService.createNode(spaceSlug, payload);
      },
      onSuccess: (node) => {
        setCreatedEntityId(node.id);
        queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ["context-nodes"] });
        queryClient.invalidateQueries({ queryKey: ["context-children"] });
        queryClient.invalidateQueries({ queryKey: ["new-node-modal", "contexts", spaceSlug] });
        const createdKind =
          node.nodeType === BackendNodeType.CONTEXT ? "Context" : "Node";

        addNotification({
          type: "success",
          source: "node",
          title: `${createdKind} created`,
          description: `"${node.title}" was created successfully.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: "error",
          source: "node",
          title: "Creation failed",
          description:
            error instanceof Error ? error.message : "Could not create the node.",
        });
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
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });

      addNotification({
        type: "success",
        source: "space",
        title: "Space created",
        description: `"${space.name}" was created successfully.`,
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        source: "space",
        title: "Space creation failed",
        description:
          error instanceof Error ? error.message : "Could not create the space.",
      });
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
      setManualSystemNodeType(defaultType === "context" ? "CONTEXT" : "REGULAR");
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      setSelectedContextSlug(defaultContextSlug || "");
      setNewContextTitle("");
      setManualContextColor("#9333ea");
    } else {
      // Reset everything when modal closes
      setTitle("");
      setInitialContent("");
      setManualEntityType("");
      setManualEntityColor("#94a3b8");
      setCreatedEntityId(null);
      setEntityType(defaultType);
      setIsCreating(false);
      setShowDuplicateModal(false);
      setDuplicateNode(null);
      setPendingTitle("");
      setManualSystemNodeType(defaultType === "context" ? "CONTEXT" : "REGULAR");
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      setSelectedContextSlug(defaultContextSlug || "");
      setNewContextTitle("");
      setManualContextColor("#9333ea");
    }
  }, [isOpen, defaultType, defaultContextSlug]);

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


  const handleSelectTemplate = useCallback(
    async (template: NodeTemplate) => {
      setSelectedTemplate(template);

      if (template.semanticType) {
        const normalizedType = template.semanticType
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        setManualEntityType(normalizedType);
        setManualEntityColor(template.accentColor ?? "#94a3b8");

        upsertEntityType({
          key: normalizedType,
          label: normalizedType.replace(/_/g, " "),
          color: template.accentColor ?? "#94a3b8",
        });
      }
    },
    [upsertEntityType]
  );

  const slugifyContextTitle = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const resolveTargetContextSlug = useCallback(async () => {
    if (!spaceSlug) return undefined;
    if (hideContextSelector && defaultContextSlug) {
      return defaultContextSlug;
    }

    const typedContextTitle = newContextTitle.trim();

    if (!typedContextTitle) {
      return selectedContextSlug || undefined;
    }

    const typedSlug = slugifyContextTitle(typedContextTitle);

    const existingContext = availableContexts.find(
      (context) =>
        context.slug === typedSlug ||
        context.title.trim().toLowerCase() === typedContextTitle.toLowerCase()
    );

    if (existingContext) {
      return existingContext.slug;
    }

    const createdContext = await nodeService.createNode(spaceSlug, {
      title: typedContextTitle,
      slug: typedSlug,
      nodeType: BackendNodeType.CONTEXT,
      content: "",
      nodeDetails: {
        createdFrom: "manual",
        showInSpaceList: true,
        contextSource: "manual",
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["new-node-modal", "contexts", spaceSlug],
      }),
      queryClient.invalidateQueries({
        queryKey: nodeKeys.list(spaceSlug, { page: 0, size: 1000 }),
      }),
      queryClient.invalidateQueries({
        queryKey: nodeKeys.lists(),
      }),
    ]);

    return createdContext.slug;
  }, [
    spaceSlug,
    newContextTitle,
    selectedContextSlug,
    availableContexts,
    queryClient,
    hideContextSelector,
    defaultContextSlug,
  ]);


  // Create entity only when user explicitly confirms creation
  const ensureEntityCreated = useCallback(
    async (options?: { openAfterCreate?: boolean; overrideTitle?: string }) => {
      if (createdEntityId || isCreating) return createdEntityId;

      const titleToUse = options?.overrideTitle?.trim() || title.trim() || "Untitled";

      setIsCreating(true);
      try {
        if (entityType === "space") {
          const space = await createSpaceMutation.mutateAsync({
            name: titleToUse,
          });

          if (options?.openAfterCreate) {
            onClose();
            router.push(`/spaces/${space.slug}`);
          }

          return space.id;
        }

        const normalizedEntityType = manualEntityType
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");


        if (entityType === "node" && normalizedEntityType) {
          upsertEntityType({
            key: normalizedEntityType,
            label: normalizedEntityType.replace(/_/g, " "),
            color: manualEntityColor,
          });
        }

        const backendType =
          entityType === "context"
            ? BackendNodeType.CONTEXT
            : (manualSystemNodeType as BackendNodeType);

        const targetContextSlug =
          backendType === BackendNodeType.REGULAR
            ? await resolveTargetContextSlug()
            : undefined;

        const node = await createNodeMutation.mutateAsync({
          title: titleToUse,
          nodeType: backendType,
          content: initialContent.trim(),
          entityType:
            entityType === "node" ? normalizedEntityType || undefined : undefined,
          contextColor:
            entityType === "context" ? manualContextColor : undefined,
          createdFrom,
          contextSlug: targetContextSlug,
        });

        if (selectedTemplate && spaceSlug) {
          await createTemplateBlocks({
            spaceSlug,
            pageId: node.id,
            blocks: selectedTemplate.blocks,
          });
        }


        if (options?.openAfterCreate && spaceSlug) {
          onClose();

          if (node.nodeType === BackendNodeType.CONTEXT) {
            router.push(`/spaces/${spaceSlug}/context/${node.slug}`);
          } else {
            router.push(`/spaces/${spaceSlug}/node/${node.id}`);
          }
        }

        return node.id;
      } catch (error) {
        console.error(`Failed to create ${entityType}:`, error);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [
      createdEntityId,
      isCreating,
      entityType,
      title,
      initialContent,
      manualEntityType,
      manualEntityColor,
      manualContextColor,
      manualSystemNodeType,
      createdFrom,
      selectedTemplate,
      upsertEntityType,
      spaceSlug,
      createNodeMutation,
      createSpaceMutation,
      onClose,
      router,
      resolveTargetContextSlug,
    ]
  );

  // Handle duplicate action from modal
  const handleDuplicateAction = useCallback(
    async (action: DuplicateAction, renamedTitle?: string) => {
      setShowDuplicateModal(false);

      switch (action) {
        case "merge":
          if (duplicateNode && spaceSlug) {
            onClose();
            router.push(`/spaces/${spaceSlug}/node/${duplicateNode.id}`);
          }
          break;

        case "create-anyway":
          await ensureEntityCreated();
          break;

        case "rename":
          if (renamedTitle) {
            setTitle(renamedTitle);
            await ensureEntityCreated({ overrideTitle: renamedTitle });
          }
          break;

        case "cancel":
          break;
      }

      setDuplicateNode(null);
      setPendingTitle("");
      
    },
    [duplicateNode, spaceSlug, onClose, router, ensureEntityCreated]
  );

  // Handle title change - create entity on first keystroke (with duplicate check)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };



  // Handle expand to full page (or create and navigate for spaces)
  const handleExpand = async () => {
    if (entityType === "space") {
      try {
        const space = await createSpaceMutation.mutateAsync({
          name: title.trim() || "Untitled",
        });
        onClose();
        router.push(`/spaces/${space.slug}`);
      } catch (error) {
        console.error("Failed to create space:", error);
      }
      return;
    }

    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    const duplicateResult = checkDuplicate(title.trim());
    if (duplicateResult.isDuplicate && duplicateResult.existingNode) {
      setDuplicateNode(duplicateResult.existingNode);
      setPendingTitle(title.trim());
      setShowDuplicateModal(true);
      return;
    }

    await ensureEntityCreated({ openAfterCreate: true });
  };

  // Handle close - save and close
  const handleClose = async () => {
    if (createdEntityId) {
      if (isSpaceMode) {
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ["spaces"] });
      } else {
        queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
      }
    }
    onClose();
  };

  // Handle create button click (for spaces, which don't auto-create)
  const handleCreate = async () => {
    if (entityType === "space") {
      try {
        const space = await createSpaceMutation.mutateAsync({
          name: title.trim() || "Untitled",
        });
        onClose();
        router.push(`/spaces/${space.slug}`);
      } catch (error) {
        console.error("Failed to create space:", error);
      }
      return;
    }

    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    const duplicateResult = checkDuplicate(title.trim());
    if (duplicateResult.isDuplicate && duplicateResult.existingNode) {
      setDuplicateNode(duplicateResult.existingNode);
      setPendingTitle(title.trim());
      setShowDuplicateModal(true);
      return;
    }

    const entityId = await ensureEntityCreated();
    if (entityId) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(41,41,41,0.5)]" onClick={handleClose} />

      {/* Modal */}
      <div className="relative flex h-[729px] w-[1100px] flex-col rounded-[37px] bg-white shadow-2xl dark:bg-[#111827]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-[24px] pt-[19px] pb-[12px]">
          <div className="flex items-center gap-[12px]">
            {/* Expand button */}
            <button
              onClick={handleExpand}
              className="flex size-6 items-center justify-center text-[#828282] transition-colors hover:text-[#333] dark:text-[#9ca3af] dark:hover:text-white"
              title="Open in full page"
            >
              <Maximize2 className="size-5" strokeWidth={1.5} />
            </button>

            {/* Entity Type Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex h-[32px] items-center gap-[8px] rounded-[100px] bg-[#e4f1ff] px-[12px] transition-colors hover:bg-[#d5e8ff] dark:bg-[#1e3a5f] dark:hover:bg-[#24476f]"
              >
                <span className="text-[#248bf2] dark:text-[#93c5fd]">{ENTITY_ICONS[entityType]}</span>
                <span
                  className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] dark:text-[#93c5fd]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {ENTITY_LABELS[entityType]}
                </span>
                <ChevronDown className="size-4 text-[#248bf2] dark:text-[#93c5fd]" strokeWidth={1.5} />
              </button>

              {/* Type Dropdown Menu */}
              {showTypeDropdown && (
                <div className="absolute left-0 top-[38px] z-10 w-[188px] rounded-[12px] bg-white px-[12px] py-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:bg-[#111827] dark:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.35)]">
                  {resolvedAvailableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setEntityType(type);

                        if (type === "context") {
                          setManualSystemNodeType("CONTEXT");
                        } else if (type === "node") {
                          setManualSystemNodeType("REGULAR");
                        }

                        setShowTypeDropdown(false);
                      }}
                      className={clsx(
                        "w-full rounded-[6px] px-[8px] py-[6px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] flex items-center gap-[8px] transition-colors",
                        entityType === type
                          ? "bg-[#e4f1ff] text-[#248bf2] dark:bg-[#1e3a5f] dark:text-[#93c5fd]"
                          : "text-[#828282] hover:bg-[#f5f5f5] hover:text-[#333] dark:text-[#9ca3af] dark:hover:bg-[#1f2937] dark:hover:text-white"
                      )}
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      <span className={entityType === type ? "text-[#248bf2] dark:text-[#93c5fd]" : "text-[#828282] dark:text-[#9ca3af]"}>
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
            className="text-[#828282] transition-colors hover:text-[#333] dark:text-[#9ca3af] dark:hover:text-white"
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
            onKeyDown={(e) => {
              // For spaces, create on Enter
              if (e.key === "Enter" && isSpaceMode) {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="Untitled"
            className="mb-2 w-full border-none bg-transparent text-[32px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] outline-none placeholder:text-[#bdbdbd] dark:text-white dark:placeholder:text-[#6b7280]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />

          {isSpaceMode ? (
            // Space mode - simple form with description and create button
            <>
              <p
                className="mb-[24px] font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] leading-[18px] text-[#bdbdbd] dark:text-[#6b7280]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Enter a name for your new space
              </p>

              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center mb-[24px]">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-[16px] bg-[#e4f1ff] dark:bg-[#1e3a5f]">
                    <FolderPlus className="size-8 text-[#248bf2]" />
                  </div>
                  <p
                    className="font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#828282] tracking-[-0.08px] dark:text-[#9ca3af]"
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
            
            <>
              <p
                className="mb-[24px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-[#9ca3af] dark:text-[#6b7280]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Fill in the node details, then create it directly or open it in the full editor.
              </p>


              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-7 space-y-5">
                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#374151] dark:text-[#e5e7eb]">
                      Initial content
                    </label>
                    <textarea
                      value={initialContent}
                      onChange={(e) => setInitialContent(e.target.value)}
                      placeholder="Add a short description, notes, or starting content..."
                      className="min-h-[220px] w-full rounded-[18px] border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-[14px] text-[#111827] outline-none transition focus:border-[#bfdbfe] focus:bg-white focus:ring-2 focus:ring-[#dbeafe] dark:border-[#374151] dark:bg-[#111827] dark:text-white dark:focus:border-[#60a5fa] dark:focus:bg-[#111827] dark:focus:ring-[#1d4ed8]/30"
                    />
                  </div>
                </div>

                <div className="col-span-5">
                  <div className="rounded-[22px] border border-[#e5e7eb] bg-[#fcfcfd] p-5 shadow-sm dark:border-[#374151] dark:bg-[#0f172a]">
                    <div className="mb-4">
                      <h3 className="text-[15px] font-semibold text-[#111827] dark:text-white">
                        {ENTITY_LABELS[entityType]} settings
                      </h3>
                      <p className="mt-1 text-[12px] leading-5 text-[#9ca3af] dark:text-[#6b7280]">
                        Configure how this {entityType} appears in the workspace.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {spaceSlug && entityType === "node" && !hideContextSelector && (
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#374151] dark:text-[#e5e7eb]">
                            <FolderPlus className="h-4 w-4 text-[#94a3b8] dark:text-[#9ca3af]" />
                            Context
                          </label>

                          <select
                            value={selectedContextSlug}
                            onChange={(e) => {
                              setSelectedContextSlug(e.target.value);
                              if (e.target.value) {
                                setNewContextTitle("");
                              }
                            }}
                            disabled={!!newContextTitle.trim()}
                            className="h-[42px] w-full rounded-[14px] border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#bfdbfe] focus:ring-2 focus:ring-[#dbeafe] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#374151] dark:bg-[#111827] dark:text-white dark:focus:border-[#60a5fa] dark:focus:ring-[#1d4ed8]/30"
                          >
                            <option value="">The Blank / no context</option>

                            {availableContexts.map((context) => (
                              <option key={context.id} value={context.slug}>
                                {context.title}
                              </option>
                            ))}
                          </select>

                          <div className="mt-3">
                            <label className="mb-2 block text-[12px] font-medium text-[#6b7280] dark:text-[#9ca3af]">
                              Or create new context
                            </label>

                            <input
                              value={newContextTitle}
                              onChange={(e) => {
                                setNewContextTitle(e.target.value);
                                if (e.target.value.trim()) {
                                  setSelectedContextSlug("");
                                }
                              }}
                              placeholder="Write new context name..."
                              className="h-[42px] w-full rounded-[14px] border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#bfdbfe] focus:ring-2 focus:ring-[#dbeafe] dark:border-[#374151] dark:bg-[#111827] dark:text-white dark:focus:border-[#60a5fa] dark:focus:ring-[#1d4ed8]/30"
                            />
                          </div>

                          <p className="mt-1 text-[11px] text-[#9ca3af] dark:text-[#6b7280]">
                            Leave both empty to create this node in The Blank.
                          </p>
                        </div>
                      )}
                      
                      
                      {entityType !== "context" && (
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#374151] dark:text-[#e5e7eb]">
                            <Box className="h-4 w-4 text-[#94a3b8] dark:text-[#9ca3af]" />
                            System type
                          </label>
                          <select
                            value={manualSystemNodeType}
                            onChange={(e) =>
                              setManualSystemNodeType(e.target.value as ManualSystemNodeType)
                            }
                            className="h-[42px] w-full rounded-[14px] border border-[#e5e7eb] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#bfdbfe] focus:ring-2 focus:ring-[#dbeafe] dark:border-[#374151] dark:bg-[#111827] dark:text-white dark:focus:border-[#60a5fa] dark:focus:ring-[#1d4ed8]/30"
                          >
                            {MANUAL_SYSTEM_NODE_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {entityType === "node" && (
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowTemplateModal(true)}
                            className="inline-flex h-[40px] items-center gap-2 rounded-[14px] border border-[#dbe3ee] bg-white px-4 text-[14px] font-semibold text-[#374151] transition hover:bg-[#f8fafc] dark:border-[#374151] dark:bg-[#111827] dark:text-[#e5e7eb] dark:hover:bg-[#1f2937]"
                          >
                            <LayoutTemplate className="h-4 w-4" />
                            {selectedTemplate ? "Change template" : "Start from template"}
                          </button>
                          {selectedTemplate && (
                            <div className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[13px] text-[#4b5563] dark:border-[#374151] dark:bg-[#111827] dark:text-[#d1d5db]">
                              <span className="font-medium">Template:</span>
                              <span>{selectedTemplate.name}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedTemplate(null)}
                                className="ml-1 text-[#9ca3af] hover:text-[#ef4444]"
                                title="Remove template"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {entityType === "context" && (
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#374151] dark:text-[#e5e7eb]">
                            <Tag className="h-4 w-4 text-[#94a3b8] dark:text-[#9ca3af]" />
                            Context color
                          </label>

                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={manualContextColor}
                              onChange={(e) => setManualContextColor(e.target.value)}
                              className="h-[36px] w-[52px] rounded-[10px] border border-[#e5e7eb] bg-white p-1 dark:border-[#374151] dark:bg-[#111827]"
                            />

                            <span
                              className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                              style={{
                                backgroundColor: `${manualContextColor}22`,
                                color: manualContextColor,
                              }}
                            >
                              Context color
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#374151] dark:text-[#e5e7eb]">
                          <Sparkles className="h-4 w-4 text-[#94a3b8] dark:text-[#9ca3af]" />
                          Source
                        </label>
                        <div className="flex h-[42px] items-center rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] px-3 text-[14px] text-[#4b5563] dark:border-[#374151] dark:bg-[#111827] dark:text-[#d1d5db]">
                          Manual
                        </div>
                      </div>
                    
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={handleCreate}
                        disabled={isCreating || createNodeMutation.isPending}
                        className="h-[42px] rounded-[100px] bg-[#248bf2] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d78d6] disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                      >
                        {isCreating || createNodeMutation.isPending ? "Creating..." : `Create ${ENTITY_LABELS[entityType]}`}
                      </button>

                      <button
                        onClick={handleExpand}
                        disabled={isCreating || createNodeMutation.isPending}
                        className="h-[42px] rounded-[100px] border border-[#dbe3ee] bg-white px-5 text-[14px] font-semibold text-[#374151] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#374151] dark:bg-[#111827] dark:text-[#e5e7eb] dark:hover:bg-[#1f2937]"
                        type="button"
                      >
                        Create and open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status bar - only for nodes/contexts */}
        {!isSpaceMode && createdEntityId && (
          <div className="flex items-center justify-between border-t border-[#f2f2f2] px-[24px] py-[12px] dark:border-[#374151]">
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#bdbdbd] tracking-[-0.08px] dark:text-[#6b7280]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Created successfully
            </span>
            <button
              onClick={handleExpand}
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#248bf2] tracking-[-0.08px] hover:underline dark:text-[#93c5fd]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Open full page →
            </button>
          </div>
        )}
      </div>


      {showTemplateModal && (
        <NodeTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onUseTemplate={handleSelectTemplate}
          showApplyMode={false}
        />
      )}

      {/* Duplicate Node Modal */}
      {duplicateNode && showDuplicateModal && (
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
