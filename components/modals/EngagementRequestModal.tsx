// components/modals/EngagementRequestModal.tsx
"use client";

import { useState } from 'react';
import { FaTimes, FaMicrophone } from 'react-icons/fa';

interface EngagementRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (message: string) => void;
  groupName: string;
}

const EngagementRequestModal = ({ isOpen, onClose, onSubmitRequest, groupName }: EngagementRequestModalProps) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!message.trim()) {
      alert('Please enter a message for your request.');
      return;
    }
    
    onSubmitRequest(message);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FaMicrophone className="mr-2 text-yellow-400" />
            Request to Speak
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-4">
            You're currently listening to <span className="font-semibold">{groupName}</span>. 
            Send a request to the group owner to join the conversation.
          </p>
          
          <label className="block text-gray-300 font-medium mb-2">
            Your message to the group owner:
          </label>
          <textarea 
            placeholder="e.g., I'd like to practice speaking English with the group..."
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 h-24 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
          />
          <p className="text-gray-400 text-xs mt-1">
            {message.length}/200 characters
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default EngagementRequestModal;