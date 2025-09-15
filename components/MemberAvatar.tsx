// components/MemberAvatar.tsx

import { FaCrown, FaPlus, FaMicrophone } from 'react-icons/fa';
import { getFlagEmoji } from '@/utils/flags';
import { useVoice } from '@/context/VoiceContext';
import React from 'react';

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string;
  isHost?: boolean;
  isInvite?: boolean;
  isOwner?: boolean;
  isSpeaker?: boolean;
  isPurpleCrownAdmin?: boolean;
  nationality?: string;
  userId?: string;
}

const MemberAvatar = ({ name, avatarUrl, isHost = false, isInvite = false, isOwner = false, isSpeaker = false, isPurpleCrownAdmin = false, nationality, userId }: MemberAvatarProps) => {
  const { voiceState } = useVoice();
  const isSpeaking = userId && voiceState.speakingUsers.has(userId);
  // If this is the "Invite" button
  if (isInvite) {
    return (
      <div className="flex flex-col items-center text-center">
        <button className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-2 hover:bg-gray-600 transition">
          <FaPlus className="text-gray-400 text-2xl" />
        </button>
        <p className="font-semibold text-gray-300">{name}</p>
      </div>
    );
  }

  // If this is a regular user
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-20 h-20 mb-2">
        <img src={avatarUrl} alt={name} className={`w-full h-full rounded-full object-cover border-2 transition-all duration-300 ${
          isSpeaking 
            ? 'border-green-400 shadow-lg shadow-green-400/30' 
            : 'border-gray-600'
        }`} />
        {nationality && (
          <div className="absolute -bottom-1 -right-1 text-lg">
            {getFlagEmoji(nationality)}
          </div>
        )}
        {/* Voice Activity Indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 -left-2 bg-green-500 p-1.5 rounded-full border-2 border-green-300 shadow-lg animate-pulse">
            <FaMicrophone className="text-green-100 text-xs" />
          </div>
        )}
        {isOwner && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 p-1.5 rounded-full border-2 border-yellow-300 shadow-lg">
            <FaCrown className="text-yellow-100 text-sm" />
          </div>
        )}
        {isPurpleCrownAdmin && !isOwner && (
          <div className="absolute -top-2 -right-2 bg-purple-500 p-1.5 rounded-full border-2 border-purple-300 shadow-lg">
            <FaCrown className="text-purple-100 text-sm" />
          </div>
        )}
        {isSpeaker && !isOwner && (
          <div className="absolute -top-2 -right-2 bg-green-500 p-1 rounded-full border-2 border-green-300">
            <div className="w-2 h-2 bg-green-100 rounded-full"></div>
          </div>
        )}
        {isHost && !isOwner && !isSpeaker && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 p-1 rounded-full">
            <FaCrown className="text-white text-xs" />
          </div>
        )}
      </div>
      <p className="font-semibold text-gray-200 truncate w-20">{name}</p>
    </div>
  );
};

export default React.memo(MemberAvatar);