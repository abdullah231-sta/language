"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  nationality: string;
  nativeLanguage: string;
  targetLanguages: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  joinedAt: Date;
  isOnline: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nationality: string;
  nativeLanguage: string;
  targetLanguages: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user data on app load
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        // Initialize demo users if they don't exist
        const existingUsers = localStorage.getItem('languageAppUsers');
        if (!existingUsers) {
          const demoUsers = [
            {
              id: 'demo-user-1',
              username: 'demo_user',
              email: 'demo@example.com',
              password: 'demo123',
              firstName: 'Demo',
              lastName: 'User',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop',
              nationality: 'US',
              nativeLanguage: 'English',
              targetLanguages: ['Spanish', 'French'],
              level: 'Intermediate' as const,
              joinedAt: new Date('2024-01-15'),
              isOnline: false
            },
            {
              id: 'demo-user-2',
              username: 'language_learner',
              email: 'learner@example.com',
              password: 'learner123',
              firstName: 'Language',
              lastName: 'Learner',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
              nationality: 'ES',
              nativeLanguage: 'Spanish',
              targetLanguages: ['English', 'German'],
              level: 'Advanced' as const,
              joinedAt: new Date('2024-02-20'),
              isOnline: false
            }
          ];
          localStorage.setItem('languageAppUsers', JSON.stringify(demoUsers));
        }

        const storedUser = localStorage.getItem('languageAppUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Convert joinedAt back to Date object
          userData.joinedAt = new Date(userData.joinedAt);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading stored user data:', error);
        localStorage.removeItem('languageAppUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check stored users for demo purposes
      const storedUsers = JSON.parse(localStorage.getItem('languageAppUsers') || '[]');
      const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = foundUser;
        const userWithOnlineStatus = {
          ...userWithoutPassword,
          isOnline: true,
          joinedAt: new Date(userWithoutPassword.joinedAt)
        };
        
        setUser(userWithOnlineStatus);
        localStorage.setItem('languageAppUser', JSON.stringify(userWithOnlineStatus));
        
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Wrong email or password. Please try again.' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem('languageAppUsers') || '[]');
      const existingEmailUser = storedUsers.find((u: any) => u.email.toLowerCase() === userData.email.toLowerCase());
      const existingUsernameUser = storedUsers.find((u: any) => u.username.toLowerCase() === userData.username.toLowerCase());
      
      if (existingEmailUser) {
        setIsLoading(false);
        return { success: false, error: 'User with this email already exists. Please try logging in.' };
      }
      
      if (existingUsernameUser) {
        setIsLoading(false);
        return { success: false, error: 'Username already taken. Please choose a different username.' };
      }
      
      // Create new user
      const newUser: User & { password: string } = {
        id: `user-${Date.now()}`,
        ...userData,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`,
        joinedAt: new Date(),
        isOnline: true
      };
      
      // Store user in users array (with password for demo)
      storedUsers.push(newUser);
      localStorage.setItem('languageAppUsers', JSON.stringify(storedUsers));
      
      // Set current user (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('languageAppUser', JSON.stringify(userWithoutPassword));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('languageAppUser');
    // In a real app, you might also call an API to invalidate the session
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('languageAppUser', JSON.stringify(updatedUser));
      
      // Also update in the users array
      const storedUsers = JSON.parse(localStorage.getItem('languageAppUsers') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...updates };
        localStorage.setItem('languageAppUsers', JSON.stringify(storedUsers));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User, RegisterData };