// components/ConversationListItem.tsx

interface ConversationListItemProps {
  name: string;
  lastMessage: string;
  avatarUrl: string;
  isActive?: boolean;
}

const ConversationListItem = ({ name, lastMessage, avatarUrl, isActive = false }: ConversationListItemProps) => {
  // Determine the background color based on whether the chat is active
  const activeClass = isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100';

  return (
    <div className={`flex items-center p-3 cursor-pointer rounded-lg transition ${activeClass}`}>
      <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover mr-4" />
      <div className="flex-1 overflow-hidden">
        <h3 className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>{name}</h3>
        <p className={`text-sm truncate ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>{lastMessage}</p>
      </div>
    </div>
  );
};

export default ConversationListItem;