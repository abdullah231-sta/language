"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  groupId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  reactions?: { [emoji: string]: string[] };
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
}

interface RealTimeChatContextType {
  // Connection status
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Messages
  messages: { [groupId: string]: Message[] };
  sendMessage: (groupId: string, content: string, type?: 'text' | 'image' | 'file', replyTo?: Message['replyTo']) => void;
  addReaction: (groupId: string, messageId: string, emoji: string) => void;
  removeReaction: (groupId: string, messageId: string, emoji: string) => void;
  
  // Online users
  onlineUsers: { [groupId: string]: OnlineUser[] };
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Typing indicators
  typingUsers: { [groupId: string]: string[] };
  startTyping: (groupId: string) => void;
  stopTyping: (groupId: string) => void;
  
  // Voice activity (for future voice chat features)
  voiceActivity: { [groupId: string]: { [userId: string]: boolean } };
}

const RealTimeChatContext = createContext<RealTimeChatContextType | null>(null);

interface RealTimeChatProviderProps {
  children: React.ReactNode;
}

export const RealTimeChatProvider: React.FC<RealTimeChatProviderProps> = ({ children }) => {
  const { username, avatar } = useUser();
  const { addNotification } = useNotifications();
  
  // WebSocket connection
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const typingTimeout = useRef<{ [groupId: string]: NodeJS.Timeout }>({});
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<{ [groupId: string]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<{ [groupId: string]: OnlineUser[] }>({});
  const [typingUsers, setTypingUsers] = useState<{ [groupId: string]: string[] }>({});
  const [voiceActivity, setVoiceActivity] = useState<{ [groupId: string]: { [userId: string]: boolean } }>({});
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  // Initialize sample data
  useEffect(() => {
    // Initialize with sample messages for demonstration
    const sampleMessages: { [groupId: string]: Message[] } = {
      '1': [
        {
          id: 'system-1',
          content: 'Welcome to the English Learners group! 🎉',
          senderId: 'system',
          senderName: 'System',
          senderAvatar: '',
          groupId: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'system'
        },
        {
          id: 'msg-1',
          content: 'Hi everyone! Excited to practice English here 😊',
          senderId: 'user-2',
          senderName: 'Sarah',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
          groupId: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          type: 'text',
          reactions: { '👍': ['user-3', 'user-4'], '❤️': ['user-3'] }
        }
      ]
    };

    const sampleOnlineUsers: { [groupId: string]: OnlineUser[] } = {
      '1': [
        {
          id: 'user-2',
          name: 'Sarah',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
          status: 'online',
          lastSeen: new Date()
        },
        {
          id: 'user-3',
          name: 'Marco',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
          status: 'online',
          lastSeen: new Date()
        }
      ]
    };

    setMessages(sampleMessages);
    setOnlineUsers(sampleOnlineUsers);
  }, []);

  // Simulate WebSocket connection (in a real app, this would connect to an actual WebSocket server)
  const connectWebSocket = () => {
    if (!username) return;

    setConnectionStatus('connecting');

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Add current user to online users for joined groups
      joinedGroups.forEach(groupId => {
        setOnlineUsers(prev => ({
          ...prev,
          [groupId]: [
            ...(prev[groupId] || []).filter(user => user.id !== username),
            {
              id: username,
              name: username,
              avatar: avatar || '',
              status: 'online',
              lastSeen: new Date()
            }
          ]
        }));
      });
    }, 1000);
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  // Connect on mount if user is logged in
  useEffect(() => {
    if (username) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      Object.values(typingTimeout.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [username]);

  // Send message
  const sendMessage = (groupId: string, content: string, type: 'text' | 'image' | 'file' = 'text', replyTo?: Message['replyTo']) => {
    if (!isConnected || !username) return;

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      senderId: username,
      senderName: username,
      senderAvatar: avatar || '',
      groupId,
      timestamp: new Date(),
      type,
      reactions: {},
      ...(replyTo && { replyTo })
    };

    // Add message to local state immediately (optimistic update)
    setMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), message]
    }));

    // Simulate server broadcast to other users
    setTimeout(() => {
      // Simulate receiving reactions from other users occasionally
      if (Math.random() > 0.7) {
        setTimeout(() => {
          addReaction(groupId, message.id, ['👍', '❤️', '😊'][Math.floor(Math.random() * 3)]);
        }, 2000);
      }
    }, 500);

    // Stop typing indicator
    stopTyping(groupId);
  };

  // Add reaction
  const addReaction = (groupId: string, messageId: string, emoji: string) => {
    if (!username) return;

    setMessages(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) {
            reactions[emoji] = [];
          }
          if (!reactions[emoji].includes(username)) {
            reactions[emoji].push(username);
          }
          return { ...msg, reactions };
        }
        return msg;
      })
    }));
  };

  // Remove reaction
  const removeReaction = (groupId: string, messageId: string, emoji: string) => {
    if (!username) return;

    setMessages(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter(userId => userId !== username);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          }
          return { ...msg, reactions };
        }
        return msg;
      })
    }));
  };

  // Join group
  const joinGroup = (groupId: string) => {
    if (!username || joinedGroups.has(groupId)) return;

    setJoinedGroups(prev => new Set([...prev, groupId]));

    // Add user to online users list
    setOnlineUsers(prev => ({
      ...prev,
      [groupId]: [
        ...(prev[groupId] || []).filter(user => user.id !== username),
        {
          id: username,
          name: username,
          avatar: avatar || '',
          status: 'online',
          lastSeen: new Date()
        }
      ]
    }));

    // Send system message
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      content: `${username} joined the group`,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '',
      groupId,
      timestamp: new Date(),
      type: 'system'
    };

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), systemMessage]
      }));
    }, 500);
  };

  // Leave group
  const leaveGroup = (groupId: string) => {
    if (!username || !joinedGroups.has(groupId)) return;

    setJoinedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });

    // Remove user from online users list
    setOnlineUsers(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(user => user.id !== username)
    }));

    // Clear typing indicator
    setTypingUsers(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(userId => userId !== username)
    }));
  };

  // Start typing
  const startTyping = (groupId: string) => {
    if (!username || !isConnected) return;

    // Clear existing timeout
    if (typingTimeout.current[groupId]) {
      clearTimeout(typingTimeout.current[groupId]);
    }

    // Add user to typing list
    setTypingUsers(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []).filter(userId => userId !== username), username]
    }));

    // Auto-stop typing after 3 seconds
    typingTimeout.current[groupId] = setTimeout(() => {
      stopTyping(groupId);
    }, 3000);
  };

  // Stop typing
  const stopTyping = (groupId: string) => {
    if (!username) return;

    // Clear timeout
    if (typingTimeout.current[groupId]) {
      clearTimeout(typingTimeout.current[groupId]);
      delete typingTimeout.current[groupId];
    }

    // Remove user from typing list
    setTypingUsers(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(userId => userId !== username)
    }));
  };

  const value: RealTimeChatContextType = {
    isConnected,
    connectionStatus,
    messages,
    sendMessage,
    addReaction,
    removeReaction,
    onlineUsers,
    joinGroup,
    leaveGroup,
    typingUsers,
    startTyping,
    stopTyping,
    voiceActivity
  };

  return (
    <RealTimeChatContext.Provider value={value}>
      {children}
    </RealTimeChatContext.Provider>
  );
};

export const useRealTimeChat = () => {
  const context = useContext(RealTimeChatContext);
  if (!context) {
    throw new Error('useRealTimeChat must be used within a RealTimeChatProvider');
  }
  return context;
};

export default RealTimeChatProvider;