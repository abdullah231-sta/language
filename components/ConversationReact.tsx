// components/ConversationReact.tsx
"use client";

import { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import WebSocketService from '@/lib/websocket';
import { useVoice } from '@/context/VoiceContext';

interface VoiceControls {
  isMuted: boolean;
}

interface ConversationReactProps {
  userId: string;
  seatPosition: number;
  isCurrentUser: boolean;
  groupId: string; // Add groupId prop
  onVoiceControlChange?: (userId: string, controls: VoiceControls) => void;
  onEmojiReaction?: (seatPosition: number, emoji: string) => void;
  className?: string;
}

const ConversationReact: React.FC<ConversationReactProps> = ({
  userId,
  seatPosition,
  isCurrentUser,
  groupId,
  onVoiceControlChange,
  onEmojiReaction,
  className = ""
}) => {
  const [voiceControls, setVoiceControls] = useState<VoiceControls>({
    isMuted: false,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recentReaction, setRecentReaction] = useState<string>('');

  // Use voice context for actual audio control
  const { toggleMute, voiceState, joinVoiceChannel } = useVoice();

  // Auto-join voice channel if not connected and user is at table
  useEffect(() => {
    if (isCurrentUser && !voiceState.isConnected && !voiceState.isLoading) {
      // Try to join voice channel
      joinVoiceChannel(`group_${groupId}`, userId).catch(error => {
        console.error('Failed to auto-join voice:', error);
      });
    }
  }, [isCurrentUser, voiceState.isConnected, voiceState.isLoading, groupId, userId, joinVoiceChannel]);

  // Available emoji reactions
  const emojiOptions = [
    '👍', '👎', '❤️', '😂', '😮', '😢', 
    '👏', '🔥', '💯', '🎉', '👋', '🤔'
  ];

  // Sync local state with voice context state
  useEffect(() => {
    setVoiceControls(prev => ({
      ...prev,
      isMuted: voiceState.isMuted
    }));
  }, [voiceState.isMuted]);

  const handleToggleMute = async () => {
    try {
      // If not connected to voice, try to join first
      if (!voiceState.isConnected) {
        await joinVoiceChannel(`group_${groupId}`, userId);
        // Wait a bit for connection
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Actually toggle the microphone mute using Agora
      await toggleMute();

      const newControls = {
        ...voiceControls,
        isMuted: !voiceControls.isMuted
      };
      setVoiceControls(newControls);

      // Call API to update voice controls in database
      const response = await fetch(`/api/groups/${groupId}/voice-controls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: newControls.isMuted ? 'mute' : 'unmute',
          targetUserId: userId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Send WebSocket event
        const wsService = WebSocketService.getInstance();
        wsService.sendVoiceControl(groupId, newControls.isMuted ? 'mute' : 'unmute', userId);

        onVoiceControlChange?.(userId, newControls);
      } else {
        console.error('Failed to update voice controls:', result.error);
        // Revert state on failure
        setVoiceControls(voiceControls);
      }
    } catch (error) {
      console.error('Error updating voice controls:', error);
      // Revert state on failure
      setVoiceControls(voiceControls);
    }
  };

  const handleEmojiClick = async (emoji: string) => {
    try {
      setRecentReaction(emoji);
      setShowEmojiPicker(false);

      // Call API to record emoji reaction
      const response = await fetch(`/api/groups/${groupId}/emoji-reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          emoji,
          seatPosition
        })
      });

      const result = await response.json();

      if (result.success) {
        // Send WebSocket event
        const wsService = WebSocketService.getInstance();
        wsService.sendEmojiReaction(groupId, emoji, seatPosition);

        onEmojiReaction?.(seatPosition, emoji);
      } else {
        console.error('Failed to send emoji reaction:', result.error);
        // Clear reaction on failure
        setRecentReaction('');
      }
    } catch (error) {
      console.error('Error sending emoji reaction:', error);
      // Clear reaction on failure
      setRecentReaction('');
    }

    // Clear reaction after 3 seconds (only if successful)
    setTimeout(() => {
      setRecentReaction('');
    }, 3000);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Listen for incoming emoji reactions from other users
  useEffect(() => {
    const wsService = WebSocketService.getInstance();
    
    const handleEmojiReactionReceived = (data: { emoji: string; seatPosition: number }) => {
      // Only show emoji if it matches this user's seat position
      if (data.seatPosition === seatPosition) {
        setRecentReaction(data.emoji);
        // Clear reaction after 3 seconds
        setTimeout(() => {
          setRecentReaction('');
        }, 3000);
      }
    };

    wsService.on('emoji_reaction_received', handleEmojiReactionReceived);

    return () => {
      wsService.off('emoji_reaction_received', handleEmojiReactionReceived);
    };
  }, [seatPosition]);

  if (!isCurrentUser) {
    // Show emoji in the middle of the profile for other users
    return recentReaction ? (
      <div className={`absolute inset-0 flex items-center justify-center text-5xl animate-bounce z-20 ${className}`}>
        {recentReaction}
      </div>
    ) : null;
  }

  // For current user: show emoji in the middle of profile when present, but always show controls below
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Emoji reaction display in middle of profile */}
      {recentReaction && (
        <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce z-30">
          {recentReaction}
        </div>
      )}

      {/* Voice controls positioned below profile */}
      {!voiceState.isConnected ? (
        <div className="absolute -bottom-[28rem] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 z-20">
          {/* Emoji picker - shows above controls */}
          {showEmojiPicker && (
            <div className="emoji-picker-container bg-black/95 p-3 rounded-lg shadow-xl backdrop-blur-sm border border-gray-600 mb-2">
              <div className="grid grid-cols-6 gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg hover:bg-gray-700 p-1 rounded transition-all duration-200 transform hover:scale-110 active:scale-95"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                Click an emoji to react
              </div>
            </div>
          )}

          <div className="bg-black/95 p-2 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700">
            <button
              onClick={() => joinVoiceChannel(`group_${groupId}`, userId)}
              disabled={voiceState.isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
              title="Join voice chat"
            >
              {voiceState.isLoading ? 'Connecting...' : 'Join Voice'}
            </button>
            {voiceState.error && (
              <div className="text-red-400 text-xs mt-1 max-w-32 truncate" title={voiceState.error}>
                Error: {voiceState.error}
              </div>
            )}
          </div>
          {/* Emoji reactions still work without voice */}
          <button
            onClick={toggleEmojiPicker}
            className="bg-yellow-600 text-white p-2 rounded-md text-xs hover:bg-yellow-700 transition-all duration-200 transform hover:scale-110"
            title="Send emoji reaction"
          >
            😀
          </button>
        </div>
      ) : (
        <div className="absolute -bottom-[29rem] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 z-20">
          {/* Emoji picker - shows above voice controls */}
          {showEmojiPicker && (
            <div className="emoji-picker-container bg-black/95 p-3 rounded-lg shadow-xl backdrop-blur-sm border border-gray-600 mb-2">
              <div className="grid grid-cols-6 gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg hover:bg-gray-700 p-1 rounded transition-all duration-200 transform hover:scale-110 active:scale-95"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                Click an emoji to react
              </div>
            </div>
          )}

          {/* Voice control buttons */}
          <div className="flex items-center gap-7 bg-black/95 p-2 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700">
            {/* Connection status indicator */}
            <div className="flex items-center mr-1">
              <div className={`w-2 h-2 rounded-full ${voiceState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} title={voiceState.isConnected ? 'Voice connected' : 'Voice disconnected'}></div>
            </div>

            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-md text-xs transition-all duration-200 transform hover:scale-110 ${
                voiceControls.isMuted
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/50'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              title={voiceControls.isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {voiceControls.isMuted ? (
                <FaMicrophoneSlash className="text-xl" />
              ) : (
                <FaMicrophone className="text-xl" />
              )}
            </button>

            <button
              onClick={toggleEmojiPicker}
              className="bg-yellow-600 text-white p-2 rounded-md text-xl hover:bg-yellow-700 transition-all duration-200 transform hover:scale-110"
              title="Send emoji reaction"
            >
              😀
            </button>
          </div>
          {/* Error display */}
          {voiceState.error && (
            <div className="bg-red-900/95 p-2 rounded-lg shadow-lg backdrop-blur-sm border border-red-700">
              <div className="text-red-400 text-xs max-w-48 truncate" title={voiceState.error}>
                Voice Error: {voiceState.error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationReact;