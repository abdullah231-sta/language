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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emoji: string) => {
    if (onReact) {
      onReact(emoji);
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
    <div className={`flex items-start mb-3 group ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} flex-1 max-w-xl`}>
        <div
          className={`relative p-3 rounded-lg ${bubbleColor} transition-all duration-200 hover:shadow-md cursor-pointer`}
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
              <p className="text-sm leading-relaxed">{isDeleted ? '[Message deleted]' : text}</p>
              {isEdited && !isDeleted && (
                <span className="text-xs opacity-60 italic ml-2">edited</span>
              )}
            </>
          )}

          {/* Message Status */}
          {isSender && !isDeleted && (
            <div className={`absolute -bottom-1 -right-1 text-xs ${getStatusColor()} bg-gray-800 rounded-full px-1 py-0.5 border border-gray-600`}>
              {getStatusIcon()}
            </div>
          )}

          {/* Emoji Reactions */}
          {reactions.length > 0 && !isDeleted && (
            <div className={`absolute bottom-0 flex flex-wrap gap-1 ${isSender ? 'left-0' : 'right-0'} -mb-2`}>
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  className="text-white px-1.5 py-0.5 rounded text-xs transition-all duration-200 hover:scale-110 bg-gray-800 border border-gray-600"
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 1 && <span className="ml-1">{reaction.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Reaction Buttons */}
        <div
          className={`flex gap-1 transition-all duration-300 ${
            showQuickReactions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          {quickEmojis.slice(0, 4).map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="w-6 h-6 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-sm transition-all duration-200 hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div
        className={`relative flex-shrink-0 ${isSender ? 'mr-1' : 'ml-1'}`}
        onMouseEnter={() => setShowQuickReactions(true)}
        onMouseLeave={() => setShowQuickReactions(false)}
      >
        <div
          className={`cursor-pointer p-1.5 transition-all duration-200 hover:bg-gray-700 rounded-full ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={() => setMenuOpen(!isMenuOpen)}
        >
          <FaEllipsisV className="text-gray-400 text-xs" />
        </div>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 w-40 top-full mt-1"
          >
            <button onClick={() => { onCopy(); setMenuOpen(false); }} className="flex items-center w-full text-left p-2 hover:bg-gray-700 text-gray-200 transition-colors rounded-t-lg text-sm">
              <FaCopy className="mr-2 text-xs" /> Copy
            </button>
            {onReply && (
              <button onClick={() => { onReply(); setMenuOpen(false); }} className="flex items-center w-full text-left p-2 hover:bg-gray-700 text-gray-200 transition-colors text-sm">
                <FaReply className="mr-2 text-xs" /> Reply
              </button>
            )}
            <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); }} className="flex items-center w-full text-left p-2 hover:bg-gray-700 text-gray-200 transition-colors text-sm">
              <FaSmile className="mr-2 text-xs" /> React
            </button>
            {onEdit && (
              <button onClick={() => { handleEditClick(); }} className="flex items-center w-full text-left p-2 hover:bg-gray-700 text-gray-200 transition-colors text-sm">
                <FaEdit className="mr-2 text-xs" /> Edit
              </button>
            )}
            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex items-center w-full text-left p-2 hover:bg-gray-700 text-red-400 transition-colors rounded-b-lg text-sm">
              <FaTrash className="mr-2 text-xs" /> Delete
            </button>
          </div>
        )}

        {/* Simple Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20 w-64 top-full mt-2"
          >
            <div className="p-3">
              <div className="grid grid-cols-6 gap-1">
                {['👍', '❤️', '😂', '😮', '😢', '😡', '😀', '😍', '🤔', '😭', '👏', '🙌'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-all duration-200 hover:scale-110 text-lg"
                  >
                    {emoji}
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
