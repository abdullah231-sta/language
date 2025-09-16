// app/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import ConversationListItem from "@/components/ConversationListItem";
import MessageBubble from "@/components/MessageBubble";
import DeleteConversationModal from "@/components/modals/DeleteConversationModal";
import { useMessaging } from "@/context/MessagingContext";
import { FaPaperPlane, FaTrash, FaTimes, FaPlus, FaUsers } from "react-icons/fa";

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
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log("Message copied!");
    });
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

  // Conversations List Component
  const ConversationsList = () => (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <button className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-800 transition-colors">
            <FaPlus className="text-sm" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => setActiveConversationId(convo.id)}
              className={`cursor-pointer border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                convo.id === activeConversationId ? 'bg-gray-800 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <ConversationListItem
                name={convo.participantName}
                lastMessage={convo.messages[convo.messages.length - 1]?.text || "No messages yet"}
                avatarUrl={convo.participantAvatar}
                isActive={convo.id === activeConversationId}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FaUsers className="text-2xl text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Start a conversation to begin chatting
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Find People to Chat With
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Chat Area Component
  const ChatArea = () => (
    <div className="h-full flex flex-col bg-gray-800">
      {activeConversation ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-900">
            <div className="flex items-center justify-between">
              <Link href={`/profile/${activeConversation.participantName.toLowerCase().replace(' ', '-')}`}>
                <div className="flex items-center hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
                  <img
                    src={activeConversation.participantAvatar}
                    alt={activeConversation.participantName}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{activeConversation.participantName}</h3>
                    <p className="text-sm text-green-400">Online</p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
            <div className="space-y-4">
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
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            {replyingTo && (
              <div className="mb-3 p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Replying to {replyingTo.sender}</p>
                    <p className="text-sm text-gray-300 truncate">{replyingTo.text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="ml-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Message ${activeConversation.participantName}...`}
                  className="w-full p-3 border border-gray-600 rounded-lg text-gray-200 bg-gray-700 text-sm focus:border-blue-500 focus:outline-none resize-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px]"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
            <p className="text-gray-500 text-sm">Choose from your conversations to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="h-full flex">
        {/* Conversations List - Left Panel */}
        <div className="w-56 border-r border-gray-700 flex-shrink-0">
          <ConversationsList />
        </div>

        {/* Chat Area - Right Panel */}
        <div className="flex-1">
          <ChatArea />
        </div>
      </div>

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