// lib/websocket.ts
import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  groupId: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
  reactions?: { [emoji: string]: string[] };
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export interface OnlineUser {
  userId: string;
  username: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageHandlers: Map<string, Function[]> = new Map();
  private currentUserId: string = '';
  private currentUsername: string = '';

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(userId: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('WebSocket already connected, resolving immediately');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('WebSocket connection already in progress, rejecting...');
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.currentUserId = userId;
      this.currentUsername = username;

      const serverUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : window.location.origin;

      console.log('Initializing WebSocket connection to:', serverUrl);

      try {
        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 5000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected successfully, socket ID:', this.socket?.id);
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // Authenticate with the server
          console.log('Sending authentication request...');
          this.socket!.emit('authenticate', { userId, username });

          this.emit('connection_established', {});
          resolve();
        });

        this.socket.on('authenticated', (data) => {
          if (data.success) {
            console.log('Successfully authenticated with Socket.IO server');
          }
        });

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false;
          console.error('Socket.IO connection error:', error);
          this.emit('connection_error', {
            error: {
              message: error?.message || 'Connection failed',
              type: 'connection_error',
              description: 'Failed to connect to WebSocket server'
            }
          });
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnecting = false;
          console.log('Socket.IO disconnected:', reason);
          this.emit('connection_lost', { reason });

          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnect();
          }
        });

        // Set up message listeners
        this.setupMessageListeners();

      } catch (error) {
        this.isConnecting = false;
        console.error('Failed to initialize Socket.IO connection:', error);
        reject(error);
      }
    });
  }

  private setupMessageListeners() {
    if (!this.socket) return;

    // Forward all server messages to our event handlers
    const messageTypes = [
      'new_message', 'user_joined', 'user_left', 'online_users',
      'typing_update', 'message_reaction', 'message_edited',
      'message_deleted', 'message_read', 'user_status_changed',
      'voice_control_changed', 'emoji_reaction_received'
    ];

    messageTypes.forEach(type => {
      this.socket!.on(type, (data) => {
        this.emit(type, data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max_reconnect_attempts_reached', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.currentUserId && this.currentUsername) {
        this.connect(this.currentUserId, this.currentUsername).catch(() => {
          // Reconnection failed, will try again
        });
      }
    }, delay);
  }

  // Event handling
  on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, payload: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  // Group operations
  joinGroup(groupId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_group', { groupId });
    } else {
      console.warn('Socket.IO not connected. Cannot join group:', groupId);
    }
  }

  leaveGroup(groupId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_group', { groupId });
    } else {
      console.warn('Socket.IO not connected. Cannot leave group:', groupId);
    }
  }

  // Messaging
  sendMessage(groupId: string, content: string, type: 'text' | 'image' | 'file' = 'text', senderAvatar: string = '', replyTo?: any) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        groupId,
        content,
        type,
        senderAvatar,
        replyTo
      });
    } else {
      console.warn('Socket.IO not connected. Message not sent:', { groupId, content });
    }
  }

  // Typing indicators
  startTyping(groupId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { groupId });
    }
  }

  stopTyping(groupId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { groupId });
    }
  }

  // Reactions
  addReaction(groupId: string, messageId: string, emoji: string) {
    if (this.socket?.connected) {
      this.socket.emit('add_reaction', { groupId, messageId, emoji });
    }
  }

  removeReaction(groupId: string, messageId: string, emoji: string) {
    if (this.socket?.connected) {
      this.socket.emit('remove_reaction', { groupId, messageId, emoji });
    }
  }

  // Message editing
  editMessage(groupId: string, messageId: string, content: string) {
    if (this.socket?.connected) {
      this.socket.emit('edit_message', { groupId, messageId, content });
    }
  }

  // Message deletion
  deleteMessage(groupId: string, messageId: string) {
    if (this.socket?.connected) {
      this.socket.emit('delete_message', { groupId, messageId });
    }
  }

  // Read receipts
  markAsRead(groupId: string, messageId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { groupId, messageId });
    }
  }

  // Voice controls
  sendVoiceControl(groupId: string, action: 'mute' | 'unmute' | 'deafen' | 'undeafen', targetUserId: string) {
    if (this.socket?.connected) {
      this.socket.emit('voice_control', { groupId, action, targetUserId });
    } else {
      console.warn('Socket.IO not connected. Voice control not sent:', { groupId, action, targetUserId });
    }
  }

  // Emoji reactions
  sendEmojiReaction(groupId: string, emoji: string, seatPosition: number) {
    if (this.socket?.connected) {
      this.socket.emit('emoji_reaction', { groupId, emoji, seatPosition });
    } else {
      console.warn('Socket.IO not connected. Emoji reaction not sent:', { groupId, emoji, seatPosition });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';

    if (this.socket.connected) return 'connected';
    if (this.socket.disconnected) return 'disconnected';
    return 'connecting';
  }
}

export default WebSocketService;