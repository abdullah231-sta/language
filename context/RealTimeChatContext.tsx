"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';

// Define interfaces for the chat context
interface ChatMessage {
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

interface OnlineUser {
  userId: string;
  username: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

interface RealTimeChatContextType {
  // Connection status
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Messages
  messages: { [groupId: string]: ChatMessage[] };
  sendMessage: (groupId: string, content: string, type?: 'text' | 'image' | 'file', replyTo?: ChatMessage['replyTo']) => void;
  addReaction: (groupId: string, messageId: string, emoji: string) => void;
  removeReaction: (groupId: string, messageId: string, emoji: string) => void;
  
  // Online users
  onlineUsers: { [groupId: string]: OnlineUser[] };
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Typing indicators
  typingUsers: { [groupId: string]: TypingUser[] };
  startTyping: (groupId: string) => void;
  stopTyping: (groupId: string) => void;
  
  // Voice activity (for future voice chat features)
  voiceActivity: { [groupId: string]: { [userId: string]: boolean } };

  // Simulate receiving messages (for testing)
  simulateReceivedMessage: (groupId: string, content: string, senderName: string) => void;
}

const RealTimeChatContext = createContext<RealTimeChatContextType | null>(null);

export const RealTimeChatProvider = ({ children }: { children: ReactNode }) => {
  const { username, avatar } = useUser();
  const { addNotification } = useNotifications();
  const typingTimeouts = useRef<{ [groupId: string]: NodeJS.Timeout }>({});
  const [currentActiveTab, setCurrentActiveTab] = useState(true);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<{ [groupId: string]: ChatMessage[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<{ [groupId: string]: OnlineUser[] }>({});
  const [typingUsers, setTypingUsers] = useState<{ [groupId: string]: TypingUser[] }>({});
  const [voiceActivity, setVoiceActivity] = useState<{ [groupId: string]: { [userId: string]: boolean } }>({});
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  // Initialize with sample data for demo and load from API
  useEffect(() => {
    const loadMessagesForGroup = async (groupId: string) => {
      try {
        const response = await fetch(`/api/messages?groupId=${groupId}&limit=100`);
        const data = await response.json();
        
        if (data.success && data.messages) {
          const apiMessages: ChatMessage[] = data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            senderName: msg.users?.username || 'Unknown User',
            senderAvatar: '',
            groupId: msg.groupId,
            timestamp: new Date(msg.createdAt).getTime(),
            type: 'text' as const,
            reactions: {},
            replyTo: undefined
          }));

          setMessages(prev => ({
            ...prev,
            [groupId]: apiMessages
          }));
        }
      } catch (error) {
        console.error('Failed to load messages for group', groupId, error);
      }
    };

    // Load messages for joined groups
    if (joinedGroups.size > 0) {
      joinedGroups.forEach(groupId => {
        loadMessagesForGroup(groupId);
      });
    } else {
      // Initialize with sample data for demo when no groups joined
      const sampleMessages: { [groupId: string]: ChatMessage[] } = {
        '1': [
          {
            id: 'system-1',
            content: 'Welcome to the English Learners group! 🎉',
            senderId: 'system',
            senderName: 'System',
            senderAvatar: '',
            groupId: '1',
            timestamp: Date.now() - 1000 * 60 * 30,
            type: 'system'
          },
          {
            id: 'msg-1',
            content: 'Hi everyone! Excited to practice English here 😊',
            senderId: 'user-2',
            senderName: 'Sarah',
            senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
            groupId: '1',
            timestamp: Date.now() - 1000 * 60 * 25,
            type: 'text',
            reactions: { '👍': ['user-3', 'user-4'], '❤️': ['user-3'] }
          }
        ]
      };

      setMessages(sampleMessages);
    }

    const sampleOnlineUsers: { [groupId: string]: OnlineUser[] } = {
      '1': [
        { userId: 'user-2', username: 'Sarah' },
        { userId: 'user-3', username: 'John' },
        { userId: 'user-4', username: 'Maria' }
      ]
    };

    setOnlineUsers(sampleOnlineUsers);
    
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
    }, 1000);
  }, [joinedGroups]);

  // Track tab visibility for notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      setCurrentActiveTab(!document.hidden);
    };

    const handleFocus = () => setCurrentActiveTab(true);
    const handleBlur = () => setCurrentActiveTab(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Method implementations
  const joinGroup = useCallback((groupId: string) => {
    setJoinedGroups(prev => new Set([...prev, groupId]));
  }, []);

  const leaveGroup = useCallback((groupId: string) => {
    setJoinedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });
  }, []);

  const sendMessage = useCallback(async (groupId: string, content: string, type: 'text' | 'image' | 'file' = 'text', replyTo?: ChatMessage['replyTo']) => {
    if (!username) return;
    
    const tempId = `msg-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      content,
      senderId: username,
      senderName: username,
      senderAvatar: avatar || '',
      groupId,
      timestamp: Date.now(),
      type,
      replyTo
    };
    
    // Optimistically add message to local state
    setMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMessage]
    }));

    try {
      // Persist message to database
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: username, // This would be user ID in real app
          groupId,
          type
        }),
      });

      const data = await response.json();
      
      if (data.success && data.message) {
        // Update the message with the real ID from database
        setMessages(prev => ({
          ...prev,
          [groupId]: prev[groupId].map(msg => 
            msg.id === tempId 
              ? { ...msg, id: data.message.id, timestamp: new Date(data.message.createdAt).getTime() }
              : msg
          )
        }));
      } else {
        // Remove the optimistic message on failure
        setMessages(prev => ({
          ...prev,
          [groupId]: prev[groupId].filter(msg => msg.id !== tempId)
        }));
        console.error('Failed to save message:', data.error);
      }
    } catch (error) {
      // Remove the optimistic message on error
      setMessages(prev => ({
        ...prev,
        [groupId]: prev[groupId].filter(msg => msg.id !== tempId)
      }));
      console.error('Error saving message:', error);
    }

    // Trigger notification for new message (simulate for other users)
    if (!currentActiveTab) {
      addNotification({
        type: 'message',
        title: `New message in group chat`,
        message: `${username}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        groupId,
        userId: username
      });
    }
  }, [username, avatar, currentActiveTab, addNotification]);

  const startTyping = useCallback((groupId: string) => {
    if (!username) return;
    
    setTypingUsers(prev => {
      const currentTyping = prev[groupId] || [];
      const userAlreadyTyping = currentTyping.some(u => u.userId === username);
      
      if (!userAlreadyTyping) {
        return {
          ...prev,
          [groupId]: [...currentTyping, { userId: username, username }]
        };
      }
      return prev;
    });
    
    if (typingTimeouts.current[groupId]) {
      clearTimeout(typingTimeouts.current[groupId]);
    }
    
    typingTimeouts.current[groupId] = setTimeout(() => {
      stopTyping(groupId);
    }, 3000);
  }, [username]);

  const stopTyping = useCallback((groupId: string) => {
    if (!username) return;
    
    setTypingUsers(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(u => u.userId !== username)
    }));
    
    if (typingTimeouts.current[groupId]) {
      clearTimeout(typingTimeouts.current[groupId]);
      delete typingTimeouts.current[groupId];
    }
  }, [username]);

  const addReaction = useCallback((groupId: string, messageId: string, emoji: string) => {
    if (!username) return;
    
    setMessages(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(username)) {
            reactions[emoji].push(username);
          }
          return { ...msg, reactions };
        }
        return msg;
      })
    }));
  }, [username]);

  const removeReaction = useCallback((groupId: string, messageId: string, emoji: string) => {
    if (!username) return;
    
    setMessages(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter(id => id !== username);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          }
          return { ...msg, reactions };
        }
        return msg;
      })
    }));
  }, [username]);

  const simulateReceivedMessage = useCallback((groupId: string, content: string, senderName: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      content,
      senderId: `user-${senderName.toLowerCase()}`,
      senderName,
      senderAvatar: '',
      groupId,
      timestamp: Date.now(),
      type: 'text'
    };
    
    setMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMessage]
    }));

    // Trigger push notification when tab is not active or user is not the sender
    if (!currentActiveTab || senderName !== username) {
      addNotification({
        type: 'message',
        title: `New message from ${senderName}`,
        message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        groupId,
        userId: `user-${senderName.toLowerCase()}`,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(senderName)
      });
    }
  }, [currentActiveTab, username, addNotification]);

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
    voiceActivity,
    simulateReceivedMessage
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

// Request notification permission on load
if (typeof window !== 'undefined' && 'Notification' in window) {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
