// components/modals/CreateGroupModal.tsx
"use client";

import { useState } from 'react';

// Define the shape of the new group data
export interface GroupData {
  name: string;
  language: string;
  description: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: GroupData) => void; // A function passed from the parent
}

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) => {
  // State for each input field
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Japanese'); // Default value
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Basic validation
    if (!name.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    
    // Pass the data up to the home page
    onCreateGroup({ name, language, description });

    // Reset fields and close modal
    setName('');
    setLanguage('Japanese');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Group</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Group Name</label>
            <input 
              type="text" 
              placeholder="e.g., Japanese Practice for Beginners" 
              className="w-full p-2 border rounded mt-1 text-gray-900" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Main Language</label>
            <select 
              className="w-full p-2 border rounded mt-1 text-gray-900"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>Japanese</option>
              <option>English</option>
              <option>Spanish</option>
              <option>Arabic</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Description</label>
            <textarea 
              placeholder="What is this group about?" 
              className="w-full p-2 border rounded mt-1 h-24 text-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Create Group</button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;