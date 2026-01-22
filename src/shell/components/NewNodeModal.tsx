'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minimize2, Maximize2, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nodeService } from "@/services/api/node.service";
import { nodeKeys } from "@/hooks/api/useNodes";
import { NodeType as BackendNodeType } from "@/types/backend-dtos";
import { BlockEditor, BlockEditorRef } from "@/components/blocks/BlockEditor";

type NodeType = "node" | "context";

type Space = {
  id: string;
  name: string;
};

type NewNodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  spaceSlug: string;
  spaceId: string;
  currentPath?: string[];
  currentSpace?: string;
  spaces?: Space[];
  onAddSpace?: (spaceName: string) => void;
  onSpaceChange?: (spaceId: string) => void;
  parentPath?: string[];
  insertPosition?: number;
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
  insertPosition
}: NewNodeModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const blockEditorRef = useRef<BlockEditorRef>(null);

  const [nodeType, setNodeType] = useState<NodeType>("node");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: async (data: { title: string; nodeType: BackendNodeType }) => {
      return nodeService.createNode(spaceSlug, {
        title: data.title || "Untitled",
        nodeType: data.nodeType,
        content: "",
      });
    },
    onSuccess: (node) => {
      setCreatedNodeId(node.id);
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
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
    if (!isOpen) {
      setTitle("");
      setCreatedNodeId(null);
      setNodeType("node");
      setIsCreating(false);
    }
  }, [isOpen]);

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

  // Create node when user starts typing (if not already created)
  const ensureNodeCreated = useCallback(async () => {
    if (createdNodeId || isCreating) return createdNodeId;

    setIsCreating(true);
    try {
      const backendType = nodeType === "context" ? BackendNodeType.CONTEXT : BackendNodeType.REGULAR;
      const node = await createNodeMutation.mutateAsync({
        title: title || "Untitled",
        nodeType: backendType,
      });
      return node.id;
    } catch (error) {
      console.error("Failed to create node:", error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [createdNodeId, isCreating, nodeType, title, createNodeMutation]);

  // Handle title change - create node on first keystroke
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Create node on first character if not created
    if (!createdNodeId && newTitle.length === 1) {
      await ensureNodeCreated();
    }

    // Update title if node exists
    if (createdNodeId && newTitle) {
      nodeService.updateNode(spaceSlug, createdNodeId, { title: newTitle }).catch(console.error);
    }
  };

  // Handle expand to full page
  const handleExpand = async () => {
    let nodeId = createdNodeId;

    // Create node if not exists
    if (!nodeId) {
      nodeId = await ensureNodeCreated();
    }

    if (nodeId) {
      onClose();
      router.push(`/spaces/${spaceSlug}/node/${nodeId}`);
    }
  };

  // Handle close - save and navigate to node if created
  const handleClose = async () => {
    // Save any pending content before closing
    if (blockEditorRef.current) {
      await blockEditorRef.current.saveNow();
    }
    if (createdNodeId) {
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
    }
    onClose();
  };

  if (!isOpen) return null;

  const getNodeTypeLabel = () => {
    switch (nodeType) {
      case "node":
        return "Node";
      case "context":
        return "Context";
    }
  };

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

            {/* Node Type Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="bg-[#e4f1ff] h-[32px] px-[12px] rounded-[100px] flex items-center gap-[8px] hover:bg-[#d5e8ff] transition-colors"
              >
                <span
                  className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {getNodeTypeLabel()}
                </span>
                <ChevronDown className="size-4 text-[#248bf2]" strokeWidth={1.5} />
              </button>

              {/* Type Dropdown Menu */}
              {showTypeDropdown && (
                <div className="absolute left-0 top-[38px] bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[188px] py-[15px] px-[12px] z-10">
                  <button
                    onClick={() => {
                      setNodeType("node");
                      setShowTypeDropdown(false);
                    }}
                    className={clsx(
                      "w-full text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] py-[4.5px]",
                      nodeType === "node" ? "text-[#248bf2]" : "text-[#828282] hover:text-[#333]"
                    )}
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Node
                  </button>
                  <button
                    onClick={() => {
                      setNodeType("context");
                      setShowTypeDropdown(false);
                    }}
                    className={clsx(
                      "w-full text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] py-[4.5px]",
                      nodeType === "context" ? "text-[#248bf2]" : "text-[#828282] hover:text-[#333]"
                    )}
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Context
                  </button>
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
            placeholder="Untitled"
            className="w-full text-[32px] font-['Roboto:Bold',sans-serif] font-bold text-[#333] mb-2 outline-none border-none bg-transparent placeholder:text-[#bdbdbd]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />

          {/* Subtitle hint */}
          <p
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#bdbdbd] tracking-[-0.08px] leading-[18px] mb-[24px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Press &apos;/&apos; for commands
          </p>

          {/* Block Editor - only show if node is created */}
          {createdNodeId ? (
            <BlockEditor
              ref={blockEditorRef}
              pageId={createdNodeId}
              spaceSlug={spaceSlug}
              spaceId={spaceId}
            />
          ) : (
            <div
              className="min-h-[200px] text-[#9ca3af] cursor-text"
              onClick={async () => {
                const nodeId = await ensureNodeCreated();
                if (nodeId) {
                  // Focus will be handled by BlockEditor
                }
              }}
            >
              <p className="text-[15px]">Click here or start typing a title to begin editing...</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        {createdNodeId && (
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
    </div>
  );
}
