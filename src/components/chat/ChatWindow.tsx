'use client';

import './chat.css';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { MessagePrimitive } from '@assistant-ui/react';
import { getMessageText } from '@/lib/utils/text';
import {
  CheckIcon,
  CopyIcon,
  XIcon,
  MessageCircleIcon,
} from 'lucide-react';
import { nodeService } from '@/services/api';

/* COPY BUTTON */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'copied' : ''}`}
      title={copied ? 'Copied' : 'Copy'}
    >
      {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
    </button>
  );
}

function AssistantMessage({ message }: any) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const textToCopy =
    contentRef.current?.innerText?.trim() || getMessageText(message);

  return (
    <MessagePrimitive.Root className="message flex justify-start">
      <div className="bubble-wrapper">
        <div ref={contentRef} className="message-bubble assistant">
          <MessagePrimitive.Content />
        </div>

        <div className="copy-inside">
          <CopyButton value={textToCopy} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function UserMessage({ message }: any) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const textToCopy =
    contentRef.current?.innerText?.trim() || getMessageText(message);

  return (
    <MessagePrimitive.Root className="message flex justify-end">
      <div className="bubble-wrapper">
        <div ref={contentRef} className="message-bubble user">
          <MessagePrimitive.Content />
        </div>

        <div className="copy-inside">
          <CopyButton value={textToCopy} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

export function ChatWindow({
  spaceSlug,
}: {
  spaceSlug?: string | null;
}) {
  if (!spaceSlug) return null;

  const {
    runtime,
    startNewConversation,
    deleteConversation,
  } = useChatRuntime(spaceSlug);

  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string | null;
    type: 'conversation' | 'node';
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);

    window.addEventListener('click', closeMenu);

    return () => {
      window.removeEventListener('click', closeMenu);
    };
  }, []);

  if (!mounted) return null;

  const chatContent = (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[99999] bg-black text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircleIcon size={22} />
        </button>
      )}

      {open && (
        <AssistantRuntimeProvider runtime={runtime}>
          <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-sm">Assistant</h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={startNewConversation}
                  className="text-xs px-2 py-1 rounded bg-black text-white hover:bg-gray-800"
                >
                  New Chat
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <XIcon size={18} />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Thread
                components={{
                  AssistantMessage,
                  UserMessage,
                }}
              />
            </div>

            {/* CONTEXT MENU */}
            {contextMenu && (
              <div
                className="fixed bg-white rounded-[12px] shadow z-[100000]"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                }}
              >
                <button onClick={() => console.log('open tab')}>
                  Open in Tab
                </button>

                <button onClick={() => console.log('open node')}>
                  Open as node
                </button>

                <button
                  onClick={async () => {
                    const newName = window.prompt('Rename');

                    if (!newName || !contextMenu.nodeId) return;

                    await nodeService.updateNode(
                      spaceSlug,
                      contextMenu.nodeId,
                      {
                        title: newName,
                      }
                    );

                    setContextMenu(null);
                  }}
                >
                  Rename
                </button>

                <button onClick={() => console.log('duplicate')}>
                  Duplicate
                </button>

                <button onClick={() => console.log('share')}>
                  Share
                </button>

                <button
                  onClick={async () => {
                    if (!contextMenu.nodeId) return;

                    const confirmed = window.confirm('Delete?');

                    if (!confirmed) return;

                    await deleteConversation(contextMenu.nodeId);

                    setContextMenu(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </AssistantRuntimeProvider>
      )}
    </>
  );

  return createPortal(chatContent, document.body);
}
