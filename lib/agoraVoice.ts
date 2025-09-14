import AgoraRTC, { 
  IAgoraRTCClient, 
  IMicrophoneAudioTrack, 
  ICameraVideoTrack,
  ILocalAudioTrack,
  IRemoteAudioTrack
} from 'agora-rtc-sdk-ng';

export interface VoiceState {
  isConnected: boolean;
  isMuted: boolean;
  isLoading: boolean;
  participants: string[];
  speakingUsers: Set<string>;
  remoteUserVolumes: { [userId: string]: number };
  error: string | null;
}

export class AgoraVoiceService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: ILocalAudioTrack | null = null;
  private appId: string;
  private currentChannel: string | null = null;
  private currentUserId: string | null = null;
  private speakingDetectionCallback: ((userId: string, isSpeaking: boolean) => void) | null = null;
  private remoteAudioTracks: Map<string, IRemoteAudioTrack> = new Map();

  constructor() {
    this.appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
    if (!this.appId) {
      console.warn('NEXT_PUBLIC_AGORA_APP_ID is not set');
    }
  }

  async joinChannel(channelName: string, userId: string): Promise<void> {
    try {
      // Check if already connected to this channel
      if (this.currentChannel === channelName && this.client && this.client.connectionState === 'CONNECTED') {
        console.log('Already connected to channel:', channelName);
        return;
      }

      // If connected to a different channel, leave first
      if (this.currentChannel && this.currentChannel !== channelName) {
        await this.leaveChannel();
      }

      // Create client if not exists
      if (!this.client) {
        this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        
        // Add debugging event listeners
        this.client.on('user-published', async (user, mediaType) => {
          console.log('🎵 User published audio:', user.uid, mediaType);
          if (mediaType === 'audio') {
            await this.client!.subscribe(user, mediaType);
            console.log('✅ Subscribed to user audio:', user.uid);
            const remoteAudioTrack = user.audioTrack;
            if (remoteAudioTrack) {
              remoteAudioTrack.play();
              this.remoteAudioTracks.set(user.uid.toString(), remoteAudioTrack);
              console.log('🔊 Playing remote audio from:', user.uid);
            }
          }
        });

        this.client.on('user-unpublished', (user, mediaType) => {
          console.log('🔇 User unpublished:', user.uid, mediaType);
          if (mediaType === 'audio') {
            this.remoteAudioTracks.delete(user.uid.toString());
          }
        });

        // Enable audio volume indication
        this.client.enableAudioVolumeIndicator();
        
        // Voice activity detection
        this.client.on('volume-indicator', (volumes) => {
          if (this.speakingDetectionCallback) {
            console.log('Volume indicator data:', volumes.map((v: any) => ({ uid: v.uid, level: v.level, speaking: v.level > 5 })));
            
            // Track all participants to ensure we report non-speaking users as well
            const reportedUsers = new Set();
            
            volumes.forEach((volume: any) => {
              const userId = volume.uid.toString();
              const isSpeaking = volume.level > 5; // Threshold for speaking
              reportedUsers.add(userId);
              this.speakingDetectionCallback!(userId, isSpeaking);
            });
            
            // Also report all remote users who weren't in the volume report as not speaking
            this.remoteAudioTracks.forEach((_, userId) => {
              if (!reportedUsers.has(userId)) {
                this.speakingDetectionCallback!(userId, false);
              }
            });
            
            // Also check local user if not already reported
            if (this.currentUserId && !reportedUsers.has(this.currentUserId)) {
              this.speakingDetectionCallback!(this.currentUserId, false);
            }
          }
        });
      }

      // If client is in connecting state, wait for it to finish or error
      if (this.client.connectionState === 'CONNECTING') {
        console.log('Client is already connecting, please wait...');
        throw new Error('Connection already in progress. Please wait and try again.');
      }

      // If client is connected but to different channel, disconnect first
      if (this.client.connectionState === 'CONNECTED') {
        console.log('Disconnecting from current channel before joining new one...');
        await this.client.leave();
      }

      // Get token from our backend API
      const tokenResponse = await fetch('/api/agora/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          userId
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Agora token');
      }

      const { token } = await tokenResponse.json();
      
      // Join the channel with the token
      console.log('🔗 Joining channel:', channelName, 'as user:', userId);
      await this.client.join(this.appId, channelName, token, userId);
      console.log('✅ Successfully joined channel');
      
      // Store current channel and user ID
      this.currentChannel = channelName;
      this.currentUserId = userId;
      
      // Create and publish audio track
      console.log('🎤 Creating microphone audio track...');
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log('📡 Publishing audio track...');
      await this.client.publish([this.localAudioTrack]);
      console.log('✅ Audio track published successfully');

      this.currentChannel = channelName;
      this.currentUserId = userId;

      console.log('🎉 Successfully joined voice channel:', channelName);
    } catch (error) {
      console.error('❌ Failed to join voice channel:', error);
      
      // Reset state on error
      this.currentChannel = null;
      this.currentUserId = null;
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('INVALID_OPERATION')) {
          throw new Error('Voice connection conflict. Please refresh the page and try again.');
        }
        if (error.message.includes('CAN_NOT_GET_GATEWAY_SERVER')) {
          throw new Error('Agora authentication failed. Please check your App ID and ensure App Certificate is properly configured in Agora Console.');
        }
        if (error.message.includes('INVALID_APP_ID')) {
          throw new Error('Invalid Agora App ID. Please check your configuration.');
        }
        if (error.message.includes('Failed to get Agora token')) {
          throw new Error('Unable to get authentication token. Please check your server configuration.');
        }
      }
      
      throw error;
    }
  }

  async leaveChannel(): Promise<void> {
    try {
      // Close local audio track first
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      // Leave the channel if connected
      if (this.client && (this.client.connectionState === 'CONNECTED' || this.client.connectionState === 'CONNECTING')) {
        await this.client.leave();
      }

      // Reset state
      this.currentChannel = null;
      this.currentUserId = null;
      
      console.log('Successfully left voice channel');
    } catch (error) {
      console.error('Failed to leave voice channel:', error);
      
      // Force reset state even if leave fails
      this.currentChannel = null;
      this.currentUserId = null;
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      
      throw error;
    }
  }

  async toggleMute(): Promise<boolean> {
    try {
      if (this.localAudioTrack) {
        await this.localAudioTrack.setMuted(!this.localAudioTrack.muted);
        return this.localAudioTrack.muted;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      throw error;
    }
  }

  isMuted(): boolean {
    return this.localAudioTrack?.muted ?? true;
  }

  isConnected(): boolean {
    return this.client?.connectionState === 'CONNECTED' && this.currentChannel !== null;
  }

  getCurrentChannel(): string | null {
    return this.currentChannel;
  }

  // Mute/unmute a specific remote user
  async muteRemoteUser(userId: string, muted: boolean): Promise<void> {
    const remoteTrack = this.remoteAudioTracks.get(userId);
    if (remoteTrack) {
      if (muted) {
        remoteTrack.stop();
      } else {
        remoteTrack.play();
      }
      console.log(`${muted ? 'Muted' : 'Unmuted'} remote user:`, userId);
    }
  }

  // Set volume for a specific remote user (0-100)
  async setRemoteUserVolume(userId: string, volume: number): Promise<void> {
    const remoteTrack = this.remoteAudioTracks.get(userId);
    if (remoteTrack) {
      remoteTrack.setVolume(volume);
      console.log(`Set volume for user ${userId} to ${volume}`);
    }
  }

  // Set speaking detection callback
  setSpeakingDetectionCallback(callback: (userId: string, isSpeaking: boolean) => void): void {
    this.speakingDetectionCallback = callback;
  }

  // Get all remote users with their audio tracks
  getRemoteUsers(): string[] {
    return Array.from(this.remoteAudioTracks.keys());
  }

  // Set up event listeners
  onUserJoined(callback: (userId: string) => void): void {
    if (this.client) {
      this.client.on('user-joined', (user: any) => {
        console.log('👋 User joined voice channel:', user.uid);
        callback(user.uid.toString());
      });
    }
  }

  onUserLeft(callback: (userId: string) => void): void {
    if (this.client) {
      this.client.on('user-left', (user: any) => {
        console.log('👋 User left voice channel:', user.uid);
        callback(user.uid.toString());
      });
    }
  }
}

// Global instance
export const agoraVoiceService = new AgoraVoiceService();