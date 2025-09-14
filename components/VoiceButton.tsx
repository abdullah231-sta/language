'use client';

import React from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa';
import { useVoice } from '@/context/VoiceContext';

interface VoiceButtonProps {
  groupId: string;
  userId: string;
  className?: string;
}

export default function VoiceButton({ groupId, userId, className = '' }: VoiceButtonProps) {
  const { 
    voiceState, 
    joinVoiceChannel, 
    leaveVoiceChannel, 
    toggleMute, 
    muteRemoteUser,
    setRemoteUserVolume,
    isVoiceEnabled 
  } = useVoice();

  if (!isVoiceEnabled) {
    return (
      <div className="text-gray-500 text-sm">
        Voice chat not configured
      </div>
    );
  }

  const handleVoiceToggle = async () => {
    if (voiceState.isLoading) return; // Prevent multiple clicks
    
    try {
      if (voiceState.isConnected) {
        await leaveVoiceChannel();
      } else {
        await joinVoiceChannel(`group_${groupId}`, userId);
      }
    } catch (error) {
      console.error('Voice toggle error:', error);
    }
  };

  const handleMuteToggle = async () => {
    await toggleMute();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Join/Leave Voice Channel Button */}
      <button
        onClick={handleVoiceToggle}
        disabled={voiceState.isLoading}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          voiceState.isConnected
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } disabled:opacity-50`}
      >
        {voiceState.isLoading ? (
          <FaSpinner className="animate-spin" />
        ) : voiceState.isConnected ? (
          'Leave Voice'
        ) : (
          'Join Voice'
        )}
      </button>

      {/* Mute/Unmute Button - only show when connected */}
      {voiceState.isConnected && (
        <button
          onClick={handleMuteToggle}
          className={`p-2 rounded-lg transition-colors ${
            voiceState.isMuted
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          title={voiceState.isMuted ? 'Unmute' : 'Mute'}
        >
          {voiceState.isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
      )}

      {/* Speaking Users Indicator */}
      {voiceState.isConnected && voiceState.speakingUsers.size > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span>{voiceState.speakingUsers.size} speaking</span>
          </div>
        </div>
      )}

      {/* Participant Count */}
      {voiceState.isConnected && (
        <span className="text-sm text-gray-600">
          {voiceState.participants.length + 1} in voice
        </span>
      )}

      {/* Remote Users Control Panel - Only show when connected */}
      {voiceState.isConnected && voiceState.participants.length > 0 && (
        <div className="flex flex-col gap-1">
          {voiceState.participants.map(participantId => (
            <div key={participantId} className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded text-xs">
              <div className={`w-2 h-2 rounded-full ${
                voiceState.speakingUsers.has(participantId) ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="flex-1 min-w-0 truncate">User {participantId.slice(-4)}</span>
              <button
                onClick={() => muteRemoteUser(participantId, true)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Mute this user"
              >
                <FaMicrophoneSlash className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {voiceState.error && (
        <div className="text-red-500 text-sm">
          {voiceState.error}
        </div>
      )}
    </div>
  );
}