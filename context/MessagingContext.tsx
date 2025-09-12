// context/MessagingContext.tsx
"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  messages: Message[];
  lastActivity: Date;
}

interface MessagingContextType {
  conversations: Conversation[];
  addMessage: (participantId: string, participantName: string, participantAvatar: string, sender: string, text: string) => void;
  getConversation: (participantId: string) => Conversation | undefined;
  createConversation: (participantId: string, participantName: string, participantAvatar: string) => Conversation;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      participantId: 'user-3',
      participantName: 'Riven',
      participantAvatar: 'https://images.unsplash.com/photo-1516733232583-3f9b06881a7b?w=500&auto=format&fit=crop',
      messages: [
        {
          id: 'msg-1',
          sender: 'Riven',
          text: 'Hey! How are you doing?',
          timestamp: new Date('2025-09-12T14:30:00')
        },
        {
          id: 'msg-2',
          sender: 'Me',
          text: 'Hi! I\'m doing great, thanks! How about you?',
          timestamp: new Date('2025-09-12T14:32:00')
        },
        {
          id: 'msg-3',
          sender: 'Riven',
          text: 'I\'m good too! Want to practice some conversation?',
          timestamp: new Date('2025-09-12T14:35:00')
        }
      ],
      lastActivity: new Date('2025-09-12T14:35:00')
    },
    {
      id: 'conv-2',
      participantId: 'user-4',
      participantName: 'Sarah',
      participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
      messages: [
        {
          id: 'msg-4',
          sender: 'Sarah',
          text: 'Can you help me with German pronunciation?',
          timestamp: new Date('2025-09-12T13:20:00')
        }
      ],
      lastActivity: new Date('2025-09-12T13:20:00')
    }
  ]);

  const addMessage = (participantId: string, participantName: string, participantAvatar: string, sender: string, text: string) => {
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date();

    setConversations(prevConversations => {
      let existingConvIndex = prevConversations.findIndex(conv => conv.participantId === participantId);
      
      if (existingConvIndex === -1) {
        // Create new conversation
        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          participantId,
          participantName,
          participantAvatar,
          messages: [{
            id: messageId,
            sender,
            text,
            timestamp
          }],
          lastActivity: timestamp
        };
        return [newConversation, ...prevConversations];
      } else {
        // Add to existing conversation
        const updatedConversations = [...prevConversations];
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          messages: [
            ...updatedConversations[existingConvIndex].messages,
            {
              id: messageId,
              sender,
              text,
              timestamp
            }
          ],
          lastActivity: timestamp
        };
        
        // Move conversation to top
        const updatedConv = updatedConversations.splice(existingConvIndex, 1)[0];
        return [updatedConv, ...updatedConversations];
      }
    });
  };

  const getConversation = (participantId: string): Conversation | undefined => {
    return conversations.find(conv => conv.participantId === participantId);
  };

  const createConversation = (participantId: string, participantName: string, participantAvatar: string): Conversation => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participantId,
      participantName,
      participantAvatar,
      messages: [],
      lastActivity: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation;
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      addMessage,
      getConversation,
      createConversation
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};