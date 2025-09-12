// components/modals/InviteFriendsModal.tsx
"use client";

import { useState } from 'react';
import { FaTimes, FaUserPlus, FaCheck } from 'react-icons/fa';

interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteFriend: (friendId: string) => void;
}

// Mock friends data - in a real app this would come from the user's friends list
const mockFriends: Friend[] = [
  {
    id: 'friend-1',
    name: 'Emma Watson',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
    isOnline: true
  },
  {
    id: 'friend-2', 
    name: 'John Smith',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    isOnline: false
  },
  {
    id: 'friend-3',
    name: 'Lisa Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop',
    isOnline: true
  },
  {
    id: 'friend-4',
    name: 'Michael Brown',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop',
    isOnline: false
  }
];

const InviteFriendsModal = ({ isOpen, onClose, onInviteFriend }: InviteFriendsModalProps) => {
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleInvite = (friendId: string) => {
    onInviteFriend(friendId);
    setInvitedFriends(prev => new Set([...prev, friendId]));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Invite Friends</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockFriends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src={friend.avatarUrl} 
                    alt={friend.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-700 rounded-full"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-white">{friend.name}</p>
                  <p className="text-sm text-gray-400">
                    {friend.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              {invitedFriends.has(friend.id) ? (
                <div className="flex items-center text-green-400">
                  <FaCheck className="mr-2" />
                  <span className="text-sm">Invited</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleInvite(friend.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700 flex items-center"
                >
                  <FaUserPlus className="mr-1" />
                  Invite
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;