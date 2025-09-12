// app/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import ConversationListItem from "@/components/ConversationListItem";
import MessageBubble from "@/components/MessageBubble";
import DeleteConversationModal from "@/components/modals/DeleteConversationModal";
import { FaPaperPlane, FaSearch, FaTrash } from "react-icons/fa";

// Full, valid initial data
const initialConversations = [
  { 
    id: 1, 
    name: 'Elena Rodriguez', 
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg', 
    messages: [
      { sender: 'Elena', text: 'Hey!' }, 
      { sender: 'Me', text: 'Hi Elena!' }
    ] 
  },
  { 
    id: 2, 
    name: 'Kenji Tanaka', 
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg', 
    messages: [
      { sender: 'Kenji', text: 'ありがとう！' }
    ] 
  },
  { 
    id: 3, 
    name: 'Fatima Al-Fassi', 
    avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
    messages: [
      { sender: 'Fatima', text: 'Can you explain the difference?' },
    ]
  },
];

const MessagesPage = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const targetUser = searchParams.get('chatWith');
    if (targetUser) {
      const conversationToOpen = conversations.find(
        convo => convo.name.toLowerCase().replace(' ', '-') === targetUser
      );
      if (conversationToOpen) {
        setActiveConversationId(conversationToOpen.id);
      }
    } else if (conversations.length > 0 && activeConversationId === null) {
      setActiveConversationId(conversations[0].id);
    }
  }, [searchParams, conversations, activeConversationId]);

  const activeConversation = conversations.find(convo => convo.id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    const message = { sender: 'Me', text: newMessage };
    const updatedConversations = conversations.map(convo => 
      convo.id === activeConversationId 
        ? { ...convo, messages: [...convo.messages, message] } 
        : convo
    );
    setConversations(updatedConversations);
    setNewMessage("");
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert("Message copied!"));
  };

  const handleDeleteMessage = (messageIndex: number) => {
    if (!activeConversation) return;
    const updatedMessages = activeConversation.messages.filter((_, index) => index !== messageIndex);
    const updatedConversations = conversations.map(convo => 
      convo.id === activeConversationId 
        ? { ...convo, messages: updatedMessages } 
        : convo
    );
    setConversations(updatedConversations);
  };

  const confirmDeleteConversation = () => {
    const updatedConversations = conversations.filter(convo => convo.id !== activeConversationId);
    setConversations(updatedConversations);
    setActiveConversationId(null);
    setDeleteModalOpen(false);
  };

  return (
    <>
      <div className="flex h-screen bg-white">
        {/* Left Pane */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Messages</h2>
            <div className="relative mt-4">
              <input type="text" placeholder="Search messages..." className="w-full p-2 pl-10 border rounded-lg text-gray-900" />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((convo) => (
              <div key={convo.id} onClick={() => setActiveConversationId(convo.id)}>
                <ConversationListItem 
                  name={convo.name}
                  lastMessage={convo.messages[convo.messages.length - 1]?.text || "No messages yet"}
                  avatarUrl={convo.avatarUrl}
                  isActive={convo.id === activeConversationId}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane */}
        {activeConversation ? (
          <div className="w-2/3 flex flex-col">
            <Link href={`/profile/${activeConversation.name.toLowerCase().replace(' ', '-')}`}>
              <div className="p-4 border-b flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <img src={activeConversation.avatarUrl} alt={activeConversation.name} className="w-10 h-10 rounded-full object-cover mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg">{activeConversation.name}</h3>
                    <p className="text-sm text-green-500">Online</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { 
                    e.preventDefault();
                    setDeleteModalOpen(true);
                  }} 
                  className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 z-10"
                >
                  <FaTrash />
                </button>
              </div>
            </Link>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              {activeConversation.messages.map((message, index) => (
                <MessageBubble 
                  key={index}
                  text={message.text}
                  isSender={message.sender === 'Me'}
                  onCopy={() => handleCopyMessage(message.text)}
                  onDelete={() => handleDeleteMessage(index)}
                />
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder={`Message ${activeConversation.name}...`} 
                  className="flex-1 p-3 border rounded-l-lg text-gray-900"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white p-4 rounded-r-lg hover:bg-blue-700"><FaPaperPlane /></button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-2/3 flex items-center justify-center bg-gray-50"><p className="text-gray-500">Select a conversation to start chatting</p></div>
        )}
      </div>
      
      {activeConversation && (
        <DeleteConversationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDeleteConversation}
          conversationName={activeConversation.name}
        />
      )}
    </>
  );
};

export default MessagesPage;