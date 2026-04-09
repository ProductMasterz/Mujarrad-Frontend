'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import './chat.css';

import { useEffect, useRef, useState } from 'react';
import { getMessageText } from '@/lib/utils/text';
import { CheckIcon, CopyIcon } from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-icon"
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? (
        <CheckIcon size={16} className="text-green-500" />
      ) : (
        <CopyIcon size={16} />
      )}
    </button>
  );
}

 
{/**For Testing */ }

 /* const handleCopy = async () => {
    try {
      console.log('Copying:', text);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      console.log('Copied successfully');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };*/

export function ChatWindow() {
  const { runtime } = useChatRuntime();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 50;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      setIsAtBottom(atBottom);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll on new messages (only if user is at bottom)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      if (!isAtBottom) return;

      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isAtBottom]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="chat-container">
        <div className="chat-header">Chat Assistant</div>

        <div className="chat-scroll" ref={scrollRef}>
          <Thread
            components={{
              AssistantMessage: ({ message }: any) => {
                const text = getMessageText(message);
                const hasText = text && text.trim().length > 0;

                return (
                  <div className="message-wrapper group">
                    {/* Message content */}
                    <div className="aui-text">{text}</div>

                    {/* Copy button */}
                    {hasText && (
                      <div className="copy-btn">
                        <CopyButton text={text} />
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
