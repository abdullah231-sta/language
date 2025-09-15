// app/api/websocket/route.ts
import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';

interface WebSocketMessage {
  type: 'message' | 'typing_start' | 'typing_stop' | 'reaction' | 'join_group' | 'leave_group' | 'message_edit' | 'message_delete' | 'mark_read' | 'user_online' | 'user_offline';
  payload: any;
  groupId?: string;
  conversationId?: string;
  userId: string;
  username: string;
  timestamp: number;
}

interface ConnectedClient {
  ws: any;
  userId: string;
  username: string;
  groupId?: string;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private groupMembers: Map<string, Set<string>> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  initialize(server: any) {
    if (this.wss) return;

    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws, request) => {
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const userId = url.searchParams.get('userId') || '';
      const username = url.searchParams.get('username') || '';
      
      const clientId = `${userId}_${Date.now()}`;
      this.clients.set(clientId, { ws, userId, username });

      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(clientId);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        payload: { clientId },
        timestamp: Date.now()
      }));
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'join_group':
        if (message.groupId) this.handleJoinGroup(clientId, message.groupId);
        break;
      
      case 'leave_group':
        if (message.groupId) this.handleLeaveGroup(clientId, message.groupId);
        break;
      
      case 'message':
        this.handleChatMessage(clientId, message);
        break;
      
      case 'message_edit':
        this.handleMessageEdit(clientId, message);
        break;
      
      case 'message_delete':
        this.handleMessageDelete(clientId, message);
        break;
      
      case 'mark_read':
        this.handleMarkAsRead(clientId, message);
        break;
      
      case 'typing_start':
        if (message.groupId) this.handleTypingStart(clientId, message.groupId);
        break;
      
      case 'typing_stop':
        if (message.groupId) this.handleTypingStop(clientId, message.groupId);
        break;
      
      case 'reaction':
        this.handleReaction(clientId, message);
        break;
      
      case 'user_online':
        this.handleUserOnline(clientId, message);
        break;
      
      case 'user_offline':
        this.handleUserOffline(clientId, message);
        break;
    }
  }

  private handleJoinGroup(clientId: string, groupId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from previous group if any
    if (client.groupId) {
      this.handleLeaveGroup(clientId, client.groupId);
    }

    client.groupId = groupId;
    
    if (!this.groupMembers.has(groupId)) {
      this.groupMembers.set(groupId, new Set());
    }
    this.groupMembers.get(groupId)!.add(clientId);

    // Notify other group members
    this.broadcastToGroup(groupId, {
      type: 'user_joined',
      payload: {
        userId: client.userId,
        username: client.username
      },
      timestamp: Date.now()
    }, clientId);

    // Send current online users to the new member
    const onlineUsers = this.getGroupOnlineUsers(groupId);
    client.ws.send(JSON.stringify({
      type: 'online_users',
      payload: { users: onlineUsers },
      timestamp: Date.now()
    }));
  }

  private handleLeaveGroup(clientId: string, groupId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    this.groupMembers.get(groupId)?.delete(clientId);
    this.typingUsers.get(groupId)?.delete(clientId);
    client.groupId = undefined;

    // Notify other group members
    this.broadcastToGroup(groupId, {
      type: 'user_left',
      payload: {
        userId: client.userId,
        username: client.username
      },
      timestamp: Date.now()
    });

    // Update typing indicators
    this.broadcastTypingUpdate(groupId);
  }

  private handleChatMessage(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client || !client.groupId) return;

    // Stop typing when message is sent
    this.handleTypingStop(clientId, client.groupId);

    // Broadcast message to all group members
    this.broadcastToGroup(client.groupId, {
      type: 'new_message',
      payload: {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message.payload.content,
        senderId: client.userId,
        senderName: client.username,
        senderAvatar: message.payload.senderAvatar || '',
        groupId: client.groupId,
        timestamp: Date.now(),
        type: message.payload.type || 'text'
      },
      timestamp: Date.now()
    });
  }

  private handleTypingStart(clientId: string, groupId: string) {
    if (!this.typingUsers.has(groupId)) {
      this.typingUsers.set(groupId, new Set());
    }
    this.typingUsers.get(groupId)!.add(clientId);
    this.broadcastTypingUpdate(groupId);
  }

  private handleReaction(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const targetGroupId = message.groupId || message.payload.groupId;
    const targetConversationId = message.conversationId || message.payload.conversationId;

    if (targetGroupId) {
      this.broadcastToGroup(targetGroupId, {
        type: 'message_reaction',
        payload: {
          messageId: message.payload.messageId,
          emoji: message.payload.emoji,
          userId: client.userId,
          action: message.payload.action // 'add' or 'remove'
        },
        timestamp: Date.now()
      });
    } else if (targetConversationId) {
      this.broadcastToConversation(targetConversationId, {
        type: 'message_reaction',
        payload: {
          messageId: message.payload.messageId,
          emoji: message.payload.emoji,
          userId: client.userId,
          action: message.payload.action // 'add' or 'remove'
        },
        timestamp: Date.now()
      }, clientId);
    }
  }

  private handleMessageEdit(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const targetGroupId = message.groupId || message.payload.groupId;
    const targetConversationId = message.conversationId || message.payload.conversationId;

    if (targetGroupId) {
      this.broadcastToGroup(targetGroupId, {
        type: 'message_edited',
        payload: {
          messageId: message.payload.messageId,
          newContent: message.payload.content,
          editedAt: Date.now()
        },
        timestamp: Date.now()
      });
    } else if (targetConversationId) {
      this.broadcastToConversation(targetConversationId, {
        type: 'message_edited',
        payload: {
          messageId: message.payload.messageId,
          newContent: message.payload.content,
          editedAt: Date.now()
        },
        timestamp: Date.now()
      }, clientId);
    }
  }

  private handleMessageDelete(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const targetGroupId = message.groupId || message.payload.groupId;
    const targetConversationId = message.conversationId || message.payload.conversationId;

    if (targetGroupId) {
      this.broadcastToGroup(targetGroupId, {
        type: 'message_deleted',
        payload: {
          messageId: message.payload.messageId,
          deletedAt: Date.now()
        },
        timestamp: Date.now()
      });
    } else if (targetConversationId) {
      this.broadcastToConversation(targetConversationId, {
        type: 'message_deleted',
        payload: {
          messageId: message.payload.messageId,
          deletedAt: Date.now()
        },
        timestamp: Date.now()
      }, clientId);
    }
  }

  private handleMarkAsRead(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const targetGroupId = message.groupId || message.payload.groupId;
    const targetConversationId = message.conversationId || message.payload.conversationId;

    if (targetGroupId) {
      this.broadcastToGroup(targetGroupId, {
        type: 'message_read',
        payload: {
          messageId: message.payload.messageId,
          userId: client.userId,
          readAt: Date.now()
        },
        timestamp: Date.now()
      });
    } else if (targetConversationId) {
      this.broadcastToConversation(targetConversationId, {
        type: 'message_read',
        payload: {
          messageId: message.payload.messageId,
          userId: client.userId,
          readAt: Date.now()
        },
        timestamp: Date.now()
      }, clientId);
    }
  }

  private handleUserOnline(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Broadcast user online status
    this.broadcastToAll({
      type: 'user_status_changed',
      payload: {
        userId: client.userId,
        username: client.username,
        status: 'online'
      },
      timestamp: Date.now()
    });
  }

  private handleUserOffline(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Broadcast user offline status
    this.broadcastToAll({
      type: 'user_status_changed',
      payload: {
        userId: client.userId,
        username: client.username,
        status: 'offline'
      },
      timestamp: Date.now()
    });
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (client && client.groupId) {
      this.handleLeaveGroup(clientId, client.groupId);
    }
    this.clients.delete(clientId);
  }

  private broadcastToGroup(groupId: string, message: any, excludeClientId?: string) {
    const groupMembers = this.groupMembers.get(groupId);
    if (!groupMembers) return;

    groupMembers.forEach(clientId => {
      if (clientId === excludeClientId) return;
      
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private broadcastTypingUpdate(groupId: string) {
    const typingUsers = Array.from(this.typingUsers.get(groupId) || [])
      .map(clientId => {
        const client = this.clients.get(clientId);
        return client ? { userId: client.userId, username: client.username } : null;
      })
      .filter(Boolean);

    this.broadcastToGroup(groupId, {
      type: 'typing_update',
      payload: { typingUsers },
      timestamp: Date.now()
    });
  }

  private broadcastToConversation(conversationId: string, message: any, excludeClientId?: string) {
    // For conversations, we need to find all clients that are in this conversation
    // This is a simplified implementation - in a real app, you'd track conversation memberships
    this.clients.forEach((client, clientId) => {
      if (clientId === excludeClientId) return;
      if (client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private getGroupOnlineUsers(groupId: string): Array<{userId: string, username: string}> {
    const groupMembers = this.groupMembers.get(groupId);
    if (!groupMembers) return [];

    return Array.from(groupMembers)
      .map(clientId => {
        const client = this.clients.get(clientId);
        return client ? { userId: client.userId, username: client.username } : null;
      })
      .filter(Boolean) as Array<{userId: string, username: string}>;
  }

  private broadcastToAll(message: any, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (clientId === excludeClientId) return;
      if (client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(JSON.stringify(message));
      }
    });
  }
}

// Note: In a real Next.js app, WebSocket connections need to be handled 
// differently. This is a conceptual implementation.
// For production, consider using Socket.IO or a dedicated WebSocket service.

export async function GET(request: NextRequest) {
  return new Response('WebSocket endpoint - upgrade connection required', {
    status: 426,
    headers: {
      'Upgrade': 'websocket'
    }
  });
}