// app/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import ConversationListItem from "@/components/ConversationListItem";
import MessageBubble from "@/components/MessageBubble";
import DeleteConversationModal from "@/components/modals/DeleteConversationModal";
import { useMessaging } from "@/context/MessagingContext";
import { FaPaperPlane, FaSearch, FaTrash, FaTimes } from "react-icons/fa";

const MessagesPage = () => {
  const { conversations, addMessage } = useMessaging();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageReactions, setMessageReactions] = useState<{[key: string]: { emoji: string; count: number; users: string[] }[]}>({});
  const [replyingTo, setReplyingTo] = useState<{text: string, sender: string} | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const chatParam = searchParams.get('chat');
    const nameParam = searchParams.get('name');
    
    if (chatParam) {
      // Find conversation by participant ID
      const conversationToOpen = conversations.find(
        convo => convo.participantId === chatParam
      );
      if (conversationToOpen) {
        setActiveConversationId(conversationToOpen.id);
      } else if (nameParam) {
        // Create new conversation if it doesn't exist
        setActiveConversationId(`conv-${chatParam}`);
      }
    } else if (conversations.length > 0 && activeConversationId === null) {
      setActiveConversationId(conversations[0].id);
    }
  }, [searchParams, conversations, activeConversationId]);

  const activeConversation = conversations.find(convo => convo.id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    
    // If replying, include reply context
    const messageText = replyingTo 
      ? `Replying to ${replyingTo.sender}: "${replyingTo.text}"\n\n${newMessage}`
      : newMessage;
    
    addMessage(activeConversation.participantId, activeConversation.participantName, activeConversation.participantAvatar, 'Me', messageText);
    setNewMessage("");
    setReplyingTo(null); // Clear reply state
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert("Message copied!"));
  };

  const handleDeleteMessage = (messageIndex: number) => {
    // For now, we'll just show an alert - this would need to be implemented in the context
    alert("Delete message functionality would be implemented here");
  };

  const handleReactToMessage = (conversationId: string, messageIndex: number, emoji: string) => {
    const messageKey = `${conversationId}-${messageIndex}`;
    setMessageReactions(prev => {
      const currentReactions = prev[messageKey] || [];
      const existingReactionIndex = currentReactions.findIndex(r => r.emoji === emoji);
      const userAlreadyReactedIndex = currentReactions.findIndex(r => r.users.includes('Me'));

      if (existingReactionIndex >= 0 && currentReactions[existingReactionIndex].users.includes('Me')) {
        // User clicked on the same emoji they already reacted with - remove it
        const updatedReactions = [...currentReactions];
        updatedReactions[existingReactionIndex] = {
          ...updatedReactions[existingReactionIndex],
          count: updatedReactions[existingReactionIndex].count - 1,
          users: updatedReactions[existingReactionIndex].users.filter(u => u !== 'Me')
        };

        // Remove reaction entirely if count becomes 0
        if (updatedReactions[existingReactionIndex].count <= 0) {
          updatedReactions.splice(existingReactionIndex, 1);
        }

        return {
          ...prev,
          [messageKey]: updatedReactions
        };
      } else if (userAlreadyReactedIndex >= 0) {
        // User already reacted with a different emoji - replace it
        const updatedReactions = [...currentReactions];

        // Remove user from old reaction
        updatedReactions[userAlreadyReactedIndex] = {
          ...updatedReactions[userAlreadyReactedIndex],
          count: updatedReactions[userAlreadyReactedIndex].count - 1,
          users: updatedReactions[userAlreadyReactedIndex].users.filter(u => u !== 'Me')
        };

        // Remove old reaction if count becomes 0
        if (updatedReactions[userAlreadyReactedIndex].count <= 0) {
          updatedReactions.splice(userAlreadyReactedIndex, 1);
        }

        // Add user to new reaction (or create new reaction)
        if (existingReactionIndex >= 0) {
          updatedReactions[existingReactionIndex] = {
            ...updatedReactions[existingReactionIndex],
            count: updatedReactions[existingReactionIndex].count + 1,
            users: [...updatedReactions[existingReactionIndex].users, 'Me']
          };
        } else {
          updatedReactions.push({
            emoji,
            count: 1,
            users: ['Me']
          });
        }

        return {
          ...prev,
          [messageKey]: updatedReactions
        };
      } else {
        // User hasn't reacted yet - add new reaction
        const newReaction = {
          emoji,
          count: 1,
          users: ['Me']
        };

        return {
          ...prev,
          [messageKey]: [...currentReactions, newReaction]
        };
      }
    });
  };

  const handleReplyToMessage = (messageText: string, sender: string) => {
    setReplyingTo({ text: messageText, sender });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const confirmDeleteConversation = () => {
    // For now, we'll just show an alert - this would need to be implemented in the context
    alert("Delete conversation functionality would be implemented here");
    setDeleteModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-800 text-white font-sans">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane - Conversations List */}
          <div className="w-full lg:w-1/3 border-r border-gray-700 flex flex-col bg-gray-900">
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full p-3 pl-10 border border-gray-600 rounded-lg text-gray-200 bg-gray-800 min-h-[44px] text-base focus:border-blue-500 focus:outline-none" 
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((convo) => (
                <div key={convo.id} onClick={() => setActiveConversationId(convo.id)} className="cursor-pointer">
                  <ConversationListItem 
                    name={convo.participantName}
                    lastMessage={convo.messages[convo.messages.length - 1]?.text || "No messages yet"}
                    avatarUrl={convo.participantAvatar}
                    isActive={convo.id === activeConversationId}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane - Chat Area */}
          {activeConversation ? (
            <div className="hidden lg:flex w-2/3 flex-col bg-gray-800">
              <Link href={`/profile/${activeConversation.participantName.toLowerCase().replace(' ', '-')}`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex items-center">
                    <img src={activeConversation.participantAvatar} alt={activeConversation.participantName} className="w-10 h-10 rounded-full object-cover mr-4" />
                    <div>
                      <h3 className="font-semibold text-lg text-white">{activeConversation.participantName}</h3>
                      <p className="text-sm text-green-400">Online</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      setDeleteModalOpen(true);
                    }} 
                    className="p-3 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <FaTrash />
                  </button>
                </div>
              </Link>
              
              <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
                {activeConversation.messages.map((message, index) => (
                  <MessageBubble 
                    key={index}
                    text={message.text}
                    isSender={message.sender === 'Me'}
                    onCopy={() => handleCopyMessage(message.text)}
                    onDelete={() => handleDeleteMessage(index)}
                    onReact={(emoji) => handleReactToMessage(activeConversation.id, index, emoji)}
                    onReply={() => handleReplyToMessage(message.text, message.sender)}
                    reactions={messageReactions[`${activeConversation.id}-${index}`] || []}
                    currentUser="Me"
                  />
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                {replyingTo && (
                  <div className="mb-3 p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Replying to {replyingTo.sender}</p>
                        <p className="text-sm text-gray-300 truncate">{replyingTo.text}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleCancelReply}
                        className="ml-2 text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <input 
                    type="text" 
                    placeholder={`Message ${activeConversation.participantName}...`} 
                    className="flex-1 p-4 border border-gray-600 rounded-l-lg text-gray-200 bg-gray-700 min-h-[48px] text-base focus:border-blue-500 focus:outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-blue-600 text-white p-4 rounded-r-lg hover:bg-blue-700 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors"><FaPaperPlane /></button>
                </div>
              </form>
            </div>
          ) : (
            <div className="hidden lg:flex w-2/3 items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-400 text-lg">Select a conversation to start chatting</p>
                <p className="text-gray-500 text-sm mt-2">Choose from your conversations on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Show selected conversation */}
      {activeConversation && (
        <div className="lg:hidden flex flex-col h-full bg-gray-800">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
            <button 
              onClick={() => setActiveConversationId(null)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaTimes className="text-lg mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <img src={activeConversation.participantAvatar} alt={activeConversation.participantName} className="w-8 h-8 rounded-full object-cover mr-3" />
              <div>
                <h3 className="font-semibold text-white">{activeConversation.participantName}</h3>
                <p className="text-sm text-green-400">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
            {activeConversation.messages.map((message, index) => (
              <MessageBubble 
                key={index}
                text={message.text}
                isSender={message.sender === 'Me'}
                onCopy={() => handleCopyMessage(message.text)}
                onDelete={() => handleDeleteMessage(index)}
                onReact={(emoji) => handleReactToMessage(activeConversation.id, index, emoji)}
                onReply={() => handleReplyToMessage(message.text, message.sender)}
                reactions={messageReactions[`${activeConversation.id}-${index}`] || []}
                currentUser="Me"
              />
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
            {replyingTo && (
              <div className="mb-3 p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Replying to {replyingTo.sender}</p>
                    <p className="text-sm text-gray-300 truncate">{replyingTo.text}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCancelReply}
                    className="ml-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder={`Message ${activeConversation.participantName}...`} 
                className="flex-1 p-3 border border-gray-600 rounded-l-lg text-gray-200 bg-gray-700 min-h-[44px] text-base focus:border-blue-500 focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"><FaPaperPlane /></button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile View - Conversations List (when no conversation selected) */}
      {!activeConversation && (
        <div className="lg:hidden flex flex-col h-full bg-gray-900">
          <div className="p-4 border-b border-gray-700">
            <div className="relative mt-4">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full p-3 pl-10 border border-gray-600 rounded-lg text-gray-200 bg-gray-800 min-h-[44px] text-base focus:border-blue-500 focus:outline-none" 
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length > 0 ? (
              conversations.map((convo) => (
                <div key={convo.id} onClick={() => setActiveConversationId(convo.id)} className="cursor-pointer">
                  <ConversationListItem 
                    name={convo.participantName}
                    lastMessage={convo.messages[convo.messages.length - 1]?.text || "No messages yet"}
                    avatarUrl={convo.participantAvatar}
                    isActive={convo.id === activeConversationId}
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-400 text-lg">No conversations yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start chatting with someone!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeConversation && (
        <DeleteConversationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDeleteConversation}
          conversationName={activeConversation.participantName}
        />
      )}
    </>
  );
};

export default MessagesPage;