"use client";

import React from 'react';
import { useNetworkStatus } from '@/lib/offline';
import { useRealTimeChat } from '@/context/RealTimeChatContext';

interface ConnectionStatusProps {
  className?: string;
  showChatStatus?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className = '',
  showChatStatus = false
}) => {
  const { isOnline, isConnecting } = useNetworkStatus();
  const { isConnected: chatConnected, connectionStatus } = useRealTimeChat();

  // Show chat status if requested
  if (showChatStatus) {
    const getStatusColor = () => {
      switch (connectionStatus) {
        case 'connected': return 'bg-green-500';
        case 'connecting': return 'bg-yellow-500 animate-pulse';
        case 'disconnected': return 'bg-red-500';
        case 'error': return 'bg-red-600 animate-bounce';
        default: return 'bg-gray-500';
      }
    };

    const getStatusText = () => {
      switch (connectionStatus) {
        case 'connected': return 'Chat Connected';
        case 'connecting': return 'Connecting to Chat...';
        case 'disconnected': return 'Chat Disconnected';
        case 'error': return 'Chat Connection Error';
        default: return 'Chat Status Unknown';
      }
    };

    return (
      <div className={`flex items-center gap-2 px-3 py-2 text-sm ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-gray-300">
          {getStatusText()}
        </span>
        {connectionStatus === 'error' && (
          <button 
            onClick={() => window.location.reload()}
            className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Original network status display
  if (isOnline && !isConnecting) {
    return null; // Don't show anything when online
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 text-sm ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnecting ? 'bg-yellow-500 animate-pulse' : 
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-gray-300">
        {isConnecting ? 'Reconnecting...' : 
         isOnline ? 'Connected' : 'Offline Mode'}
      </span>
    </div>
  );
};

export default ConnectionStatus;