'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import './chat.css';
import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { getMessageText } from '@/lib/utils/text';

/* -----------------------------
   Copy Button
------------------------------ */
function CopyButton({ text, id }: { text: string; id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    console.log('COPY CLICKED');
    if (!text?.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-icon pointer-events-auto relative z-50"
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <CheckIcon size={16} className="text-green-500" /> : <CopyIcon size={16} />}
    </button>
  );
}

/* -----------------------------
   Chat Window
------------------------------ */
export function ChatWindow() {
  const { runtime } = useChatRuntime();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  /* Track scroll position */
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

  /* Auto-scroll on new messages */
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
              AssistantMessage: (props: any) => {
                const id = props.message?.id ?? props.item?.id;
                const content = props.message?.content ?? props.item?.content;

                const text = getMessageText(content);

                return (
                  <div className="message-wrapper group relative">
                    <div className="aui-text">{text}</div>

                    <CopyButton text={text} id={id} />
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
