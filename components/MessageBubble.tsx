// components/MessageBubble.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaCopy, FaTrash, FaSmile, FaReply, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import React from 'react';

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  onCopy: () => void;
  onDelete: () => void;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onEdit?: (newText: string) => void;
  reactions?: { emoji: string; count: number; users: string[] }[];
  isReplying?: boolean;
  currentUser?: string;
  messageId?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp?: Date;
}

const MessageBubble = ({
  text,
  isSender,
  onCopy,
  onDelete,
  onReact,
  onReply,
  onEdit,
  reactions = [],
  isReplying = false,
  currentUser = 'Me',
  messageId,
  isEdited = false,
  isDeleted = false,
  status = 'sent',
  timestamp
}: MessageBubbleProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);
  const [isMessageClicked, setIsMessageClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [newReaction, setNewReaction] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      setIsMessageClicked(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emoji: string) => {
    if (onReact) {
      setAnimatingEmoji(emoji);
      setNewReaction(emoji);
      onReact(emoji);
      setTimeout(() => setAnimatingEmoji(null), 800);
      setTimeout(() => setNewReaction(null), 1200);
    }
    setShowEmojiPicker(false);
    setMenuOpen(false);
    setShowQuickReactions(false);
  };

  const handleMessageClick = () => {
    setMenuOpen(true);
  };

  const handleReactionClick = (emoji: string) => {
    handleEmojiClick(emoji);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditText(text);
    setMenuOpen(false);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleEditSave = () => {
    if (editText.trim() && onEdit) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending': return 'text-gray-400';
      case 'sent': return 'text-gray-400';
      case 'delivered': return 'text-gray-300';
      case 'read': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const bubbleColor = isSender ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200';

  return (
    <div className={`flex items-start mb-4 group ${isSender ? 'justify-end' : 'justify-start pl-0'}`}>
      <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start pl-0'} flex-1 max-w-2xl`}>
        <div className={`flex items-end gap-2 flex-nowrap ${isSender ? 'flex-row-reverse' : ''}`}>
          <div
            className={`relative p-3 rounded-lg max-w-lg ${bubbleColor} transition-all duration-200 hover:shadow-lg flex-shrink-0 cursor-pointer`}
            onClick={handleMessageClick}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleEditSave();
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-inherit"
                />
                <button onClick={handleEditSave} className="text-green-400 hover:text-green-300">
                  <FaCheck size={12} />
                </button>
                <button onClick={handleEditCancel} className="text-red-400 hover:text-red-300">
                  <FaTimes size={12} />
                </button>
              </div>
            ) : (
              <>
                <p>{isDeleted ? '[Message deleted]' : text}</p>
                {isEdited && !isDeleted && (
                  <span className="text-xs opacity-60 italic">edited</span>
                )}
              </>
            )}

            {/* Message Status */}
            {isSender && !isDeleted && (
              <div className={`absolute -bottom-1 -right-1 text-sm font-bold ${getStatusColor()} bg-gray-800 rounded-full px-1 py-0.5 border border-gray-600 shadow-sm`}>
                {getStatusIcon()}
              </div>
            )}

            {/* Emoji Reactions - Positioned at bottom corner */}
            {reactions.length > 0 && !isDeleted && (
              <div className={`absolute bottom-0 flex flex-wrap gap-1 ${isSender ? 'left-0' : 'right-0'} -mb-2`}>
                {reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReactionClick(reaction.emoji)}
                    className={`relative text-white px-1 py-0.5 rounded text-xs transition-all duration-300 hover:scale-125 flex items-center gap-1 flex-shrink-0 ${
                      animatingEmoji === reaction.emoji
                        ? 'animate-bounce scale-110 text-yellow-300 drop-shadow-lg'
                        : newReaction === reaction.emoji
                        ? 'animate-pulse scale-125 text-green-400 drop-shadow-lg'
                        : 'hover:scale-110 hover:text-blue-300'
                    }`}
                  >
                    <span className={`transition-all duration-300 ${
                      newReaction === reaction.emoji
                        ? 'animate-bounce'
                        : animatingEmoji === reaction.emoji
                        ? 'animate-pulse'
                        : ''
                    }`}>
                      {reaction.emoji}
                    </span>
                    {reaction.count > 1 && (
                      <span className={`text-xs transition-all duration-300 ${
                        newReaction === reaction.emoji
                          ? 'animate-pulse text-green-300 font-bold'
                          : animatingEmoji === reaction.emoji
                          ? 'animate-bounce text-yellow-200'
                          : ''
                      }`}>
                        {reaction.count}
                      </span>
                    )}

                    {/* Ripple effect for new reactions */}
                    {newReaction === reaction.emoji && (
                      <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Reaction Buttons */}
        <div
          className={`absolute -bottom-2 ${isSender ? '-right-2' : '-left-2'} flex gap-1 transition-all duration-300 ${
            showQuickReactions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-lg transition-all duration-200 hover:scale-125 hover:shadow-lg relative ${
                animatingEmoji === emoji ? 'animate-bounce scale-125 bg-blue-500 border-blue-400' : ''
              }`}
            >
              <span className={`transition-all duration-200 ${
                animatingEmoji === emoji ? 'animate-bounce' : ''
              }`}>
                {emoji}
              </span>

              {/* Heart effect for clicked emoji */}
              {animatingEmoji === emoji && (
                <span className="absolute -top-1 -right-1 text-red-400 animate-ping">💖</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Menu - Positioned close to message */}
      <div
        className={`relative flex-shrink-0 ${isSender ? 'mr-1' : 'ml-1'}`}
        onMouseEnter={() => setShowQuickReactions(true)}
        onMouseLeave={() => setShowQuickReactions(false)}
      >
        <div
          className={`cursor-pointer p-2 transition-all duration-200 hover:bg-gray-700 rounded-full ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={() => setMenuOpen(!isMenuOpen)}
        >
          <FaEllipsisV className="text-gray-400" />
        </div>

        {/* Menu Dropdown - Close to message */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={`absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 w-48 top-full mt-1 -left-60`}
          >
            <button onClick={() => { onCopy(); setMenuOpen(false); }} className="flex items-center w-full text-left p-3 hover:bg-gray-700 text-gray-200 transition-colors rounded-t-lg">
              <FaCopy className="mr-3" /> Copy
            </button>
            {onReply && (
              <button onClick={() => { onReply(); setMenuOpen(false); }} className="flex items-center w-full text-left p-3 hover:bg-gray-700 text-gray-200 transition-colors">
                <FaReply className="mr-3" /> Reply
              </button>
            )}
            <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); }} className="flex items-center w-full text-left p-3 hover:bg-gray-700 text-gray-200 transition-colors">
              <FaSmile className="mr-3" /> React
            </button>
            {onEdit && (
              <button onClick={() => { handleEditClick(); }} className="flex items-center w-full text-left p-3 hover:bg-gray-700 text-gray-200 transition-colors">
                <FaEdit className="mr-3" /> Edit
              </button>
            )}
            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex items-center w-full text-left p-3 hover:bg-gray-700 text-red-400 transition-colors rounded-b-lg">
              <FaTrash className="mr-3" /> Delete
            </button>
          </div>
        )}

        {/* Simple Emoji Picker - Close to message */}
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className={`absolute bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-20 w-80 max-h-96 overflow-hidden top-full mt-2 -left-145`}
          >
            <div className="p-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Reactions</h4>
              <div className="grid grid-cols-6 gap-2">
                {['👍', '❤️', '😂', '😮', '😢', '😡', '😀', '😍', '🤔', '😭', '👏', '🙌'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className={`w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-125 text-lg relative ${
                      animatingEmoji === emoji ? 'animate-bounce bg-blue-500 scale-125' : ''
                    }`}
                  >
                    <span className={`transition-all duration-200 ${
                      animatingEmoji === emoji ? 'animate-bounce' : ''
                    }`}>
                      {emoji}
                    </span>

                    {/* Sparkle effect for clicked emoji */}
                    {animatingEmoji === emoji && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="text-yellow-300 animate-ping">✨</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageBubble);
