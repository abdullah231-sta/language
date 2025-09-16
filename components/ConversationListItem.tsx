// components/ConversationListItem.tsx

interface ConversationListItemProps {
  name: string;
  lastMessage: string;
  avatarUrl: string;
  isActive?: boolean;
}

const ConversationListItem = ({ name, lastMessage, avatarUrl, isActive = false }: ConversationListItemProps) => {
  return (
    <div className="flex items-center p-3">
      <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0" />
      <div className="flex-1 overflow-hidden min-w-0">
        <h3 className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>{name}</h3>
        <p className={`text-xs truncate ${isActive ? 'text-gray-200' : 'text-gray-400'}`}>{lastMessage}</p>
      </div>
    </div>
  );
};

export default ConversationListItem;