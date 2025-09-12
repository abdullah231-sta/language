// components/MessageBubble.tsx
"use client";

import { useState } from 'react';
import { FaEllipsisV, FaCopy, FaTrash } from 'react-icons/fa';

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  onCopy: () => void;
  onDelete: () => void;
}

const MessageBubble = ({ text, isSender, onCopy, onDelete }: MessageBubbleProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  // --- No changes to these lines ---
  const bubbleAlignment = isSender ? 'justify-end' : 'justify-start';
  const bubbleColor = isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';

  return (
    // We add 'flex-row-reverse' for the sender to flip the order of bubble and menu icon
    <div className={`flex items-start mb-4 group ${isSender ? 'flex-row-reverse' : ''}`}>
      <div className={`relative p-3 rounded-lg max-w-lg ${bubbleColor}`}>
        <p>{text}</p>
      </div>

      {/* --- MENU ICON AND LOGIC (UPDATED) --- */}
      <div 
        className="relative cursor-pointer p-2 opacity-0 group-hover:opacity-100 transition"
        onClick={() => setMenuOpen(!isMenuOpen)}
      >
        <FaEllipsisV className="text-gray-400" />
        
        {/* The menu position is now controlled with 'left-0' or 'right-0' */}
        {isMenuOpen && (
          <div className={`absolute top-full mt-1 bg-white border rounded-lg shadow-lg z-10 w-32 ${isSender ? 'right-0' : 'left-0'}`}>
            <button onClick={() => { onCopy(); setMenuOpen(false); }} className="flex items-center w-full text-left p-2 hover:bg-gray-100 text-gray-800">
              <FaCopy className="mr-2" /> Copy
            </button>
            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex items-center w-full text-left p-2 hover:bg-gray-100 text-red-500">
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;