'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { agoraVoiceService, VoiceState } from '@/lib/agoraVoice';

interface VoiceContextType {
  voiceState: VoiceState;
  joinVoiceChannel: (channelName: string, userId: string) => Promise<void>;
  leaveVoiceChannel: () => Promise<void>;
  toggleMute: () => Promise<void>;
  muteRemoteUser: (userId: string, muted: boolean) => Promise<void>;
  setRemoteUserVolume: (userId: string, volume: number) => Promise<void>;
  autoJoinForTableUser: (groupId: string, userId: string, isAtTable: boolean) => Promise<void>;
  isVoiceEnabled: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isConnected: false,
    isMuted: true,
    isLoading: false,
    participants: [],
    speakingUsers: new Set(),
    remoteUserVolumes: {},
    error: null
  });

  const isVoiceEnabled = !!process.env.NEXT_PUBLIC_AGORA_APP_ID;

  const joinVoiceChannel = useCallback(async (channelName: string, userId: string) => {
    if (!isVoiceEnabled) return;
    
    setVoiceState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await agoraVoiceService.joinChannel(channelName, userId);
      
      // Set up event listeners
      agoraVoiceService.onUserJoined((newUserId) => {
        setVoiceState(prev => ({
          ...prev,
          participants: [...prev.participants, newUserId]
        }));
      });

      agoraVoiceService.onUserLeft((leftUserId) => {
        setVoiceState(prev => ({
          ...prev,
          participants: prev.participants.filter(id => id !== leftUserId),
          speakingUsers: new Set([...prev.speakingUsers].filter(id => id !== leftUserId))
        }));
      });

      // Set up speaking detection
      agoraVoiceService.setSpeakingDetectionCallback((userId, isSpeaking) => {
        console.log('Speaking detection:', { userId, isSpeaking });
        setVoiceState(prev => {
          const newSpeakingUsers = new Set(prev.speakingUsers);
          if (isSpeaking) {
            newSpeakingUsers.add(userId);
          } else {
            newSpeakingUsers.delete(userId);
          }
          console.log('Updated speakingUsers:', Array.from(newSpeakingUsers));
          return {
            ...prev,
            speakingUsers: newSpeakingUsers
          };
        });
      });

      setVoiceState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        isMuted: agoraVoiceService.isMuted()
      }));
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to join voice channel'
      }));
    }
  }, [isVoiceEnabled]);

  const leaveVoiceChannel = useCallback(async () => {
    if (!isVoiceEnabled) return;
    
    setVoiceState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await agoraVoiceService.leaveChannel();
      setVoiceState({
        isConnected: false,
        isMuted: true,
        isLoading: false,
        participants: [],
        speakingUsers: new Set(),
        remoteUserVolumes: {},
        error: null
      });
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to leave voice channel'
      }));
    }
  }, [isVoiceEnabled]);

  const toggleMute = useCallback(async () => {
    if (!isVoiceEnabled) return;
    
    try {
      const newMutedState = await agoraVoiceService.toggleMute();
      setVoiceState(prev => ({ ...prev, isMuted: newMutedState }));
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to toggle mute'
      }));
    }
  }, [isVoiceEnabled]);

  const muteRemoteUser = useCallback(async (userId: string, muted: boolean) => {
    if (!isVoiceEnabled) return;
    
    try {
      await agoraVoiceService.muteRemoteUser(userId, muted);
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mute user'
      }));
    }
  }, [isVoiceEnabled]);

  const setRemoteUserVolume = useCallback(async (userId: string, volume: number) => {
    if (!isVoiceEnabled) return;
    
    try {
      await agoraVoiceService.setRemoteUserVolume(userId, volume);
      setVoiceState(prev => ({
        ...prev,
        remoteUserVolumes: {
          ...prev.remoteUserVolumes,
          [userId]: volume
        }
      }));
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to set volume'
      }));
    }
  }, [isVoiceEnabled]);

  const autoJoinForTableUser = useCallback(async (groupId: string, userId: string, isAtTable: boolean) => {
    if (!isVoiceEnabled) return;
    
    try {
      if (isAtTable && !voiceState.isConnected) {
        console.log('🪑 User sat at table, auto-joining voice...');
        await joinVoiceChannel(`group_${groupId}`, userId);
      } else if (!isAtTable && voiceState.isConnected) {
        console.log('🚶 User left table, leaving voice...');
        await leaveVoiceChannel();
      }
    } catch (error) {
      console.error('Auto-join voice failed:', error);
    }
  }, [isVoiceEnabled, voiceState.isConnected, joinVoiceChannel, leaveVoiceChannel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceState.isConnected && agoraVoiceService.isConnected()) {
        agoraVoiceService.leaveChannel().catch(console.error);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return (
    <VoiceContext.Provider value={{
      voiceState,
      joinVoiceChannel,
      leaveVoiceChannel,
      toggleMute,
      muteRemoteUser,
      setRemoteUserVolume,
      autoJoinForTableUser,
      isVoiceEnabled
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}