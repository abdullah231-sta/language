// lib/websocket.ts
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
  private ws: WebSocket | null = null;
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
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.currentUserId = userId;
      this.currentUsername = username;

      // For development, we'll use a mock WebSocket since Next.js doesn't support WebSocket routes directly
      // In production, you'd connect to your WebSocket server
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? `ws://localhost:3001?userId=${userId}&username=${encodeURIComponent(username)}`
        : `wss://${window.location.host}/ws?userId=${userId}&username=${encodeURIComponent(username)}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connection_established', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.emit(message.type, message.payload);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.emit('connection_lost', {});
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          console.error('WebSocket error:', error);
          this.emit('connection_error', { error });
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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
      this.connect(this.currentUserId, this.currentUsername).catch(() => {
        // Reconnection failed, will try again
      });
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
    this.send({
      type: 'join_group',
      payload: {},
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  leaveGroup(groupId: string) {
    this.send({
      type: 'leave_group',
      payload: {},
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  // Messaging
  sendMessage(groupId: string, content: string, type: 'text' | 'image' | 'file' = 'text', senderAvatar: string = '', replyTo?: any) {
    this.send({
      type: 'message',
      payload: {
        content,
        type,
        senderAvatar,
        replyTo
      },
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  // Typing indicators
  startTyping(groupId: string) {
    this.send({
      type: 'typing_start',
      payload: {},
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  stopTyping(groupId: string) {
    this.send({
      type: 'typing_stop',
      payload: {},
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  // Reactions
  addReaction(groupId: string, messageId: string, emoji: string) {
    this.send({
      type: 'reaction',
      payload: {
        messageId,
        emoji,
        action: 'add'
      },
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  removeReaction(groupId: string, messageId: string, emoji: string) {
    this.send({
      type: 'reaction',
      payload: {
        messageId,
        emoji,
        action: 'remove'
      },
      groupId,
      userId: this.currentUserId,
      username: this.currentUsername,
      timestamp: Date.now()
    });
  }

  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

export default WebSocketService;