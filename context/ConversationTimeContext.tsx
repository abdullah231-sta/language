"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface ConversationTimeData {
  sessionStart: Date | null;
  sessionDuration: number; // in seconds
  dailyTotal: number; // in seconds
  weeklyTotal: number; // in seconds
  allTimeTotal: number; // in seconds
  isActive: boolean;
  currentStreak: number; // consecutive days
  longestStreak: number;
  sessionsToday: number;
}

interface ConversationTimeContextType {
  timeData: ConversationTimeData;
  startSession: (groupId: string) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  formatTime: (seconds: number) => string;
  getSessionTime: () => number;
  getTodayStats: () => { sessions: number; totalTime: number };
  getWeekStats: () => { sessions: number; totalTime: number };
}

const ConversationTimeContext = createContext<ConversationTimeContextType | undefined>(undefined);

export const useConversationTime = () => {
  const context = useContext(ConversationTimeContext);
  if (!context) {
    throw new Error('useConversationTime must be used within a ConversationTimeProvider');
  }
  return context;
};

interface ConversationTimeProviderProps {
  children: React.ReactNode;
}

export const ConversationTimeProvider: React.FC<ConversationTimeProviderProps> = ({ children }) => {
  const [timeData, setTimeData] = useState<ConversationTimeData>({
    sessionStart: null,
    sessionDuration: 0,
    dailyTotal: 0,
    weeklyTotal: 0,
    allTimeTotal: 0,
    isActive: false,
    currentStreak: 0,
    longestStreak: 0,
    sessionsToday: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentGroupRef = useRef<string | null>(null);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save data periodically and on unmount
  useEffect(() => {
    const saveInterval = setInterval(saveData, 30000); // Save every 30 seconds
    
    return () => {
      clearInterval(saveInterval);
      saveData();
    };
  }, [timeData]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timeData.isActive) {
        pauseSession();
      } else if (!document.hidden && timeData.sessionStart && !timeData.isActive) {
        resumeSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timeData.isActive, timeData.sessionStart]);

  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('conversationTimeData');
      if (saved && saved.trim()) {
        try {
          const parsed = JSON.parse(saved);
          const today = new Date().toDateString();
          const savedDate = new Date(parsed.lastActiveDate || '').toDateString();
          
          // Reset daily stats if it's a new day
          if (today !== savedDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Update streak
            let newCurrentStreak = parsed.currentStreak || 0;
            if (savedDate === yesterday.toDateString() && parsed.dailyTotal > 0) {
              newCurrentStreak += 1;
            } else if (parsed.dailyTotal === 0) {
              newCurrentStreak = 0;
            }
            
            setTimeData(prev => ({
              ...prev,
              dailyTotal: 0,
              sessionsToday: 0,
              allTimeTotal: parsed.allTimeTotal || 0,
              weeklyTotal: calculateWeeklyTotal(parsed.weeklyData || {}),
              currentStreak: newCurrentStreak,
              longestStreak: Math.max(parsed.longestStreak || 0, newCurrentStreak)
            }));
          } else {
            setTimeData(prev => ({
              ...prev,
              dailyTotal: parsed.dailyTotal || 0,
              weeklyTotal: parsed.weeklyTotal || 0,
              allTimeTotal: parsed.allTimeTotal || 0,
              currentStreak: parsed.currentStreak || 0,
              longestStreak: parsed.longestStreak || 0,
              sessionsToday: parsed.sessionsToday || 0
            }));
          }
        } catch (parseError) {
          console.error('Failed to parse conversation time data:', parseError);
          // Clear corrupted data
          localStorage.removeItem('conversationTimeData');
        }
      }
    } catch (error) {
      console.error('Failed to load conversation time data:', error);
    }
  };

  const saveData = () => {
    try {
      const dataToSave = {
        ...timeData,
        lastActiveDate: new Date().toISOString(),
        weeklyData: getWeeklyDataForStorage()
      };
      localStorage.setItem('conversationTimeData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save conversation time data:', error);
    }
  };

  const calculateWeeklyTotal = (weeklyData: any) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    weekStart.setHours(0, 0, 0, 0);
    
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayKey = day.toDateString();
      total += weeklyData[dayKey] || 0;
    }
    return total;
  };

  const getWeeklyDataForStorage = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weeklyData: any = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayKey = day.toDateString();
      if (dayKey === now.toDateString()) {
        weeklyData[dayKey] = timeData.dailyTotal;
      } else {
        const saved = localStorage.getItem('conversationTimeData');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            weeklyData[dayKey] = parsed.weeklyData?.[dayKey] || 0;
          } catch (error) {
            console.error('Failed to parse conversation time data for weekly calculation:', error);
            weeklyData[dayKey] = 0;
          }
        }
      }
    }
    return weeklyData;
  };

  const startSession = (groupId: string) => {
    if (timeData.isActive) {
      endSession(); // End current session first
    }

    currentGroupRef.current = groupId;
    const now = new Date();
    
    setTimeData(prev => ({
      ...prev,
      sessionStart: now,
      sessionDuration: 0,
      isActive: true,
      sessionsToday: prev.sessionsToday + 1
    }));

    // Start the timer
    intervalRef.current = setInterval(() => {
      setTimeData(prev => ({
        ...prev,
        sessionDuration: prev.sessionDuration + 1,
        dailyTotal: prev.dailyTotal + 1,
        weeklyTotal: prev.weeklyTotal + 1,
        allTimeTotal: prev.allTimeTotal + 1
      }));
    }, 1000);

    console.log(`Conversation time tracking started for group: ${groupId}`);
  };

  const endSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const sessionTime = timeData.sessionDuration;
    
    setTimeData(prev => ({
      ...prev,
      sessionStart: null,
      sessionDuration: 0,
      isActive: false
    }));

    currentGroupRef.current = null;
    saveData();
    
    console.log(`Session ended. Duration: ${formatTime(sessionTime)}`);
  };

  const pauseSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeData(prev => ({
      ...prev,
      isActive: false
    }));

    console.log('Session paused');
  };

  const resumeSession = () => {
    if (timeData.sessionStart && !timeData.isActive) {
      setTimeData(prev => ({
        ...prev,
        isActive: true
      }));

      intervalRef.current = setInterval(() => {
        setTimeData(prev => ({
          ...prev,
          sessionDuration: prev.sessionDuration + 1,
          dailyTotal: prev.dailyTotal + 1,
          weeklyTotal: prev.weeklyTotal + 1,
          allTimeTotal: prev.allTimeTotal + 1
        }));
      }, 1000);

      console.log('Session resumed');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getSessionTime = (): number => {
    return timeData.sessionDuration;
  };

  const getTodayStats = () => {
    return {
      sessions: timeData.sessionsToday,
      totalTime: timeData.dailyTotal
    };
  };

  const getWeekStats = () => {
    return {
      sessions: timeData.sessionsToday, // This would need to be expanded for full week
      totalTime: timeData.weeklyTotal
    };
  };

  const value: ConversationTimeContextType = {
    timeData,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    formatTime,
    getSessionTime,
    getTodayStats,
    getWeekStats
  };

  return (
    <ConversationTimeContext.Provider value={value}>
      {children}
    </ConversationTimeContext.Provider>
  );
};

export default ConversationTimeProvider;