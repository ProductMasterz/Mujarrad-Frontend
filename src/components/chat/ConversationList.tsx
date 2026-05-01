import { useState } from "react";
import { useConversations } from "@/hooks/api/useConversations";
import { Node } from "@/types/backend-dtos";

function getConversationTitle(conv: Node) {
  if (conv.title && conv.title !== 'Conversation') {
    return conv.title;
  }

  if (!conv.createdAt) return 'Untitled';

  const date = new Date(conv.createdAt);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

export function ConversationList({
  onSelect,
  activeId,
}: {
  onSelect: (id: string) => void;
  activeId: string | null;
}) {
  const { conversations, loading } = useConversations();
  const [query, setQuery] = useState('');

  if (loading) return <div>Loading...</div>;
  if (!conversations.length) return <div>No conversations yet</div>;

 const filteredConversations = conversations.filter((conv) => {
  const queryLower = query.toLowerCase();

  const titleMatch = (conv.title || '')
    .toLowerCase()
    .includes(queryLower);

  const contentMatch = (conv as any).searchableText?.includes(queryLower);

  return titleMatch || contentMatch;
});

  return (
    <div>
      <input
        type="text"
        placeholder="Search conversations..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="conversation-search"
      />

      
      {filteredConversations.map((conv) => (
        <div
          key={conv.id}
          className={`conversation-item ${
            activeId === conv.id ? 'active' : ''
          }`}
          onClick={() => onSelect(conv.id)}
        >
          <div>{getConversationTitle(conv)}</div>
        </div>
      ))}
    </div>
  );
}