import { useConversations } from "@/hooks/api/useConversations";
  
function formatConversationTitle(dateString: string) {
  const date = new Date(dateString);
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

  if (loading) return <div>Loading...</div>;

  if (!conversations.length)
    return <div>No conversations yet</div>;

  return (
    <div>
  {conversations.map((conv) => {
 const title =
  conv.title && conv.title !== 'Conversation'
    ? conv.title
    : conv.createdAt
    ? formatConversationTitle(conv.createdAt)
    : 'Untitled';

  return (
    <div
      key={conv.id}
      className={`conversation-item ${
        activeId === conv.id
    ? 'active'
    : 'hover:bg-gray-100'

      }`}
      onClick={() => onSelect(conv.id)}
    >
      <div>{title}</div>
    </div>
  );
})}
    </div>
  );
}