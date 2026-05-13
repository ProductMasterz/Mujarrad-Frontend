'use client';

import './chat.css';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import { useEffect, useRef, useState } from 'react';

import { MessagePrimitive } from '@assistant-ui/react';
import { getMessageText } from '@/lib/utils/text';
import { CheckIcon, CopyIcon, XIcon, MessageCircleIcon, Trash2Icon } from 'lucide-react';
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

  const textToCopy = contentRef.current?.innerText?.trim() || getMessageText(message);

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

  const textToCopy = contentRef.current?.innerText?.trim() || getMessageText(message);

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

export function ChatWindow({ spaceId }: { spaceId: string }) {
  const {
    runtime,
    conversations,
    conversationNodeId,
    setConversationNodeId,
    startNewConversation,
    deleteConversation,
  } = useChatRuntime(spaceId);

  const [open, setOpen] = useState(true);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string | null;
    type: 'conversation' | 'node';
  } | null>(null);

  const handleRightClick = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
      type: 'conversation',
    });
  };

  useEffect(() => {
  const closeMenu = () => setContextMenu(null);

  window.addEventListener('click', closeMenu);

  return () => {
    window.removeEventListener('click', closeMenu);
  };
}, []);
  return (
    <>
      {/* Floating Open Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircleIcon size={22} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <AssistantRuntimeProvider runtime={runtime}>
          <div className="fixed bottom-6 right-6 w-[700px] h-[420px] bg-white shadow-xl rounded-lg border z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-sm">Assistant</h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={startNewConversation}
                  className="text-xs px-2 py-1 rounded bg-black text-white hover:bg-gray-800"
                >
                  New Chat
                </button>

                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                  <XIcon size={18} />
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="flex flex-1 overflow-hidden">
              {/* SIDEBAR */}
              <div className="w-[220px] border-r bg-gray-50 overflow-y-auto">
                <div className="p-2">
                  {conversations.map((conversation: any) => {
                    const active = conversation.id === conversationNodeId;

                    return (
                      <div
                        key={conversation.id}
                        className={`group flex items-center justify-between p-2 rounded mb-1 cursor-pointer ${
                          active ? 'bg-black text-white' : 'hover:bg-gray-200'
                        }`}
                        onClick={() => setConversationNodeId(conversation.id)}
                        onContextMenu={(e) => handleRightClick(e, conversation.id)}
                      >
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium truncate">{conversation.title}</div>

                          <div className="text-xs opacity-70">
                            {new Date(conversation.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();

                            const confirmed = window.confirm('Delete this conversation?');

                            if (!confirmed) return;

                            await deleteConversation(conversation.id);
                          }}
                          className="ml-2 text-red-500"
                        >
                          <Trash2Icon size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Thread
                components={{
                  AssistantMessage,
                  UserMessage,
                }}
              />
             
              {contextMenu && (
                <div
                  className="fixed bg-white rounded-[12px] shadow z-[100]"
                  style={{
                    left: contextMenu.x,
                    top: contextMenu.y,
                  }}
                >
                  <button onClick={() => console.log('open tab')}>Open on new Tab Window</button>

                  <button onClick={() => console.log('open node')}>Open as a node</button>

                  <button
                    onClick={async () => {
                      const newName = window.prompt('Rename');
                      if (!newName || !contextMenu.nodeId) return;

                      await nodeService.updateNode(spaceId, contextMenu.nodeId, {
                        title: newName,
                      });

                      setContextMenu(null);
                    }}
                  >
                    Rename
                  </button>

                  <button onClick={() => console.log('duplicate')}>Duplicate</button>

                  <button onClick={() => console.log('share')}>Share</button>

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
          </div>
        </AssistantRuntimeProvider>
      )}
    </>
  );
}
