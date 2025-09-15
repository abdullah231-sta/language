"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationContext';
import { useRealTimeChat } from '@/context/RealTimeChatContext';
import { MobileInput, MobileButton } from './MobileOptimized';
import { ConnectionStatus } from './ConnectionStatus';
import React from 'react';
import { 
  FaPaperPlane, 
  FaSmile, 
  FaImage, 
  FaFile, 
  FaTimes,
  FaEllipsisV,
  FaReply,
  FaHeart,
  FaLaugh,
  FaThumbsUp,
  FaSadTear,
  FaAngry
} from 'react-icons/fa';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ 
  groupId, 
  groupName, 
  isVisible, 
  onToggle,
  className = "" 
}) => {
  const { username, avatar } = useUser();
  const { addNotification } = useNotifications();
  const { 
    messages: contextMessages, 
    sendMessage, 
    addReaction, 
    removeReaction, 
    joinGroup, 
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
    isConnected,
    connectionStatus,
    simulateReceivedMessage
  } = useRealTimeChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get messages for this specific group
  const messages = contextMessages[groupId] || [];
  const groupOnlineUsers = onlineUsers[groupId] || [];
  const groupTypingUsers = typingUsers[groupId] || [];

  // Join group when component mounts
  useEffect(() => {
    if (isVisible && groupId) {
      joinGroup(groupId);
    }
  }, [isVisible, groupId, joinGroup]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Start typing indicator
    if (value.trim() && !typingTimeoutRef.current) {
      startTyping(groupId);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(groupId);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send through real-time context
    sendMessage(groupId, newMessage, 'text', replyingTo ? {
      id: replyingTo.id,
      content: replyingTo.content.substring(0, 50) + (replyingTo.content.length > 50 ? '...' : ''),
      senderName: replyingTo.senderName
    } : undefined);

    setNewMessage('');
    setReplyingTo(null);
    
    // Stop typing
    stopTyping(groupId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !username) return;
    
    const hasReacted = message.reactions?.[emoji]?.includes(username);
    
    if (hasReacted) {
      removeReaction(groupId, messageId, emoji);
    } else {
      addReaction(groupId, messageId, emoji);
    }
  };

  const formatTime = (timestamp: Date | string | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: Date | string | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (msgs: any[]) => {
    const groups: { [date: string]: any[] } = {};
    
    msgs.forEach(message => {
      // Convert timestamp to Date object if it's not already one
      const timestamp = message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp);
      
      const dateKey = timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const reactions = ['❤️', '👍', '😂', '😢', '😠', '😮'];

  if (!isVisible) return null;

  return (
    <div className={`bg-gray-800 border-r border-gray-700 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">💬 Group Chat</h3>
            <div className="flex items-center space-x-2">
              <p className="text-gray-400 text-sm">{groupName}</p>
              <ConnectionStatus showChatStatus={true} className="text-xs" />
            </div>
            {groupOnlineUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">
                  {groupOnlineUsers.length} online
                </p>
                <div className="flex -space-x-1">
                  {groupOnlineUsers.slice(0, 3).map(user => (
                    <div
                      key={user.userId}
                      className="w-4 h-4 rounded-full bg-green-500 border border-gray-800"
                      title={user.username}
                    />
                  ))}
                  {groupOnlineUsers.length > 3 && (
                    <div className="w-4 h-4 rounded-full bg-gray-600 border border-gray-800 flex items-center justify-center">
                      <span className="text-xs text-white">+{groupOnlineUsers.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white p-1 rounded"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                {formatDate(new Date(date))}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isCurrentUser = message.senderId === username;
              const isSystem = message.senderId === 'system';
              const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId;

              return (
                <div key={message.id} className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''} mb-6`}>
                  <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-[80%] ${isSystem ? 'max-w-full' : ''}`}>
                    {/* Left-side message controls for received messages */}
                    {!isCurrentUser && !isSystem && (
                      <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-8 mr-1">
                        <button
                          onClick={() => handleReaction(message.id, '👍')}
                          className="p-2 rounded-full hover:bg-gray-600 text-sm transition-colors"
                          title="React with thumbs up"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, '❤️')}
                          className="p-2 rounded-full hover:bg-gray-600 text-sm transition-colors"
                          title="React with heart"
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, '😊')}
                          className="p-2 rounded-full hover:bg-gray-600 text-sm transition-colors"
                          title="React with smile"
                        >
                          😊
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(message);
                            inputRef.current?.focus();
                          }}
                          className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                          title="Reply to message"
                        >
                          <FaReply className="text-xs text-gray-400" />
                        </button>
                      </div>
                    )}

                    {/* Avatar */}
                    {!isCurrentUser && !isSystem && (
                      <div className="flex-shrink-0">
                        {showAvatar ? (
                          <img
                            src={message.senderAvatar || '/default-avatar.png'}
                            alt={message.senderName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} ${isSystem ? 'items-center' : ''}`}>
                      {/* Sender name and time */}
                      {!isCurrentUser && !isSystem && showAvatar && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-blue-400 text-sm font-medium">{message.senderName}</span>
                          <span className="text-gray-500 text-xs">{formatTime(message.timestamp)}</span>
                        </div>
                      )}

                      {/* Reply preview */}
                      {message.replyTo && (
                        <div className="bg-gray-700 border-l-4 border-blue-500 p-2 rounded mb-1 max-w-full">
                          <div className="text-blue-400 text-xs font-medium">{message.replyTo.senderName}</div>
                          <div className="text-gray-300 text-sm">{message.replyTo.content}</div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div 
                        className={`relative rounded-lg p-3 ${
                          isSystem 
                            ? 'bg-gray-700 text-gray-300 text-sm'
                            : isCurrentUser 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-white'
                        }`}
                      >
                        <div className="break-words">{message.content}</div>
                        
                        {/* Time for current user messages */}
                        {isCurrentUser && !isSystem && (
                          <div className="text-blue-200 text-xs mt-1 text-right">
                            {formatTime(message.timestamp)}
                          </div>
                        )}

                        {/* Reactions */}
                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(message.reactions).map(([emoji, userIds]) => {
                              const userIdArray = Array.isArray(userIds) ? userIds : [];
                              return (
                                <button
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(message.id, emoji);
                                  }}
                                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                                    userIdArray.includes(username || 'anonymous')
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span>{userIdArray.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right-side message controls for sent messages */}
                    {isCurrentUser && !isSystem && (
                      <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-8 ml-1">
                        <button
                          onClick={() => handleReaction(message.id, '👍')}
                          className="p-2 rounded-full hover:bg-gray-600 text-sm transition-colors"
                          title="React with thumbs up"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, '❤️')}
                          className="p-2 rounded-full hover:bg-gray-600 text-sm transition-colors"
                          title="React with heart"
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, '😊')}
                          className="p-2 rounded-full hover:bg-gray-600 text-sm transition-colors"
                          title="React with smile"
                        >
                          😊
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(message);
                            inputRef.current?.focus();
                          }}
                          className="p-2 rounded-full hover:bg-gray-600 transition-colors"
                          title="Reply to message"
                        >
                          <FaReply className="text-xs text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {/* Typing indicators */}
        {groupTypingUsers.length > 0 && (
          <div className="px-4 py-2 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>
                {groupTypingUsers.length === 1 
                  ? `${groupTypingUsers[0]} is typing...`
                  : `${groupTypingUsers.length} people are typing...`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="p-3 bg-gray-700 border-t border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-blue-400 text-sm font-medium">Replying to {replyingTo.senderName}</div>
              <div className="text-gray-300 text-sm truncate">{replyingTo.content}</div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-white ml-2"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <MobileInput
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none pr-24"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-white p-1 rounded"
                title="Add emoji"
              >
                <FaSmile className="text-sm" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-white p-1 rounded"
                title="Attach image"
              >
                <FaImage className="text-sm" />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-white p-1 rounded"
                title="Attach file"
              >
                <FaFile className="text-sm" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </form>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-20">
            <div className="grid grid-cols-8 gap-2 max-w-64">
              {['😀', '😂', '😊', '😍', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🔥', '🎉', '👏', '🙌', '💯'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:bg-gray-700 p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Multi-user testing panel - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-2">🧪 Multi-User Testing</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => simulateReceivedMessage(groupId, "Hey everyone! How's the language practice going?", "Alex")}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                Simulate Alex Message
              </button>
              <button
                onClick={() => simulateReceivedMessage(groupId, "I'm struggling with pronunciation. Any tips?", "Maria")}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                Simulate Maria Message
              </button>
              <button
                onClick={() => simulateReceivedMessage(groupId, "Let's practice some conversation! ¿Cómo están?", "Carlos")}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
              >
                Simulate Carlos Message
              </button>
              <button
                onClick={() => {
                  // Simulate multiple rapid messages
                  setTimeout(() => simulateReceivedMessage(groupId, "That's a great question!", "Alex"), 100);
                  setTimeout(() => simulateReceivedMessage(groupId, "I can help with pronunciation!", "Sarah"), 500);
                  setTimeout(() => simulateReceivedMessage(groupId, "Let's set up a voice chat session", "Maria"), 1000);
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
              >
                Simulate Conversation
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Open multiple browser tabs to test real-time sync • Check notifications when tab is inactive
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(GroupChat);