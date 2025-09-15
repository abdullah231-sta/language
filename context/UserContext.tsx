// context/UserContext.tsx

"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

// Define the shape of the data in our context
interface UserContextType {
  username: string;
  avatar: string | null;
  nativeLanguage: string;
  targetLanguage: string;
  nationality: string;
  setUsername: (name: string) => void;
  setAvatar: (url: string | null) => void;
  setNativeLanguage: (language: string) => void;
  setTargetLanguage: (language: string) => void;
  setNationality: (nationality: string) => void;
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a "Provider" component. This component will hold the actual state.
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Default values for non-authenticated users
  const [username, setUsername] = useState('Guest');
  const [avatar, setAvatar] = useState<string | null>('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop');
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [nationality, setNationality] = useState('US');

  // Update user data when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setUsername(user.username);
      setAvatar(user.avatar || null);
      setNativeLanguage(user.nativeLanguage);
      setTargetLanguage(user.targetLanguages[0] || 'Spanish'); // Use first target language
      setNationality(user.nationality);
    } else {
      // Reset to default values when not authenticated
      setUsername('Guest');
      setAvatar('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop');
      setNativeLanguage('English');
      setTargetLanguage('Spanish');
      setNationality('US');
    }
  }, [isAuthenticated, user]);

  const contextValue = useMemo(() => ({
    username,
    avatar,
    nativeLanguage,
    targetLanguage,
    nationality,
    setUsername,
    setAvatar,
    setNativeLanguage,
    setTargetLanguage,
    setNationality
  }), [username, avatar, nativeLanguage, targetLanguage, nationality]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to easily access the context's data
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};