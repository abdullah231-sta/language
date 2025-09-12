// context/UserContext.tsx

"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the data in our context
interface UserContextType {
  username: string;
  avatar: string | null;
  setUsername: (name: string) => void;
  setAvatar: (url: string | null) => void;
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a "Provider" component. This component will hold the actual state.
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState('User-1234');
  const [avatar, setAvatar] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ username, avatar, setUsername, setAvatar }}>
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