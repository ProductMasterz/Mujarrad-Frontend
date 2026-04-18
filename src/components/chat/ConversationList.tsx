import { useConversations } from "@/hooks/api/useConversations";

export function ConversationList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const { conversations, loading } = useConversations();
  

  if (loading) return <div>Loading...</div>;

  if (!conversations.length)
    return <div>No conversations yet</div>;

  return (
    <div>
      {conversations.map((conv) => (
        <div key={conv.id} className="conversation-item hover:bg-gray-100" onClick={() => onSelect(conv.id)}>
          <div>{conv.title || 'Conversation'}</div>
          <div>
            {new Date(conv.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}