"use client";

import React from 'react';
import { useNetworkStatus } from '@/lib/offline';
import { useRealTimeChat } from '@/context/RealTimeChatContext';

interface ConnectionStatusProps {
  className?: string;
  showChatStatus?: boolean;
  wsConnected?: boolean;
  reconnecting?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className = '',
  showChatStatus = false,
  wsConnected,
  reconnecting
}) => {
  const { isOnline, isConnecting } = useNetworkStatus();
  const { isConnected: chatConnected, connectionStatus } = useRealTimeChat();

  // Use provided WebSocket status if available, otherwise use context
  const actualWsConnected = wsConnected !== undefined ? wsConnected : chatConnected;
  const actualReconnecting = reconnecting !== undefined ? reconnecting : connectionStatus === 'connecting';

  // Show chat status if requested
  if (showChatStatus) {
    const getStatusColor = () => {
      if (actualReconnecting) return 'bg-yellow-500 animate-pulse';
      if (actualWsConnected) return 'bg-green-500';
      return 'bg-red-500';
    };

    const getStatusText = () => {
      if (actualReconnecting) return 'WebSocket Connecting...';
      if (actualWsConnected) return 'WebSocket Connected';
      return 'WebSocket Disconnected';
    };

    return (
      <div className={`flex items-center gap-2 px-3 py-2 text-sm ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-gray-300">
          {getStatusText()}
        </span>
        {!actualWsConnected && !actualReconnecting && (
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