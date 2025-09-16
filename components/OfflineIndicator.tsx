"use client";

import React from 'react';
import { FaWifi, FaExclamationTriangle, FaSync, FaCheckCircle } from 'react-icons/fa';
import { useOffline } from '../context/OfflineProvider';

interface OfflineIndicatorProps {
  className?: string;
  showSyncProgress?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showSyncProgress = true
}) => {
  const { isOnline, isConnecting, syncProgress, isSyncing, pendingActions } = useOffline();

  // Don't show if online and no sync activity
  if (isOnline && !isConnecting && !isSyncing && pendingActions === 0) {
    return null;
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <FaExclamationTriangle className="text-red-500" />,
        text: 'Offline',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200'
      };
    }

    if (isConnecting) {
      return {
        icon: <FaSync className="text-yellow-500 animate-spin" />,
        text: 'Connecting...',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-200'
      };
    }

    if (isSyncing && showSyncProgress) {
      const progressPercent = syncProgress.total > 0
        ? Math.round((syncProgress.completed / syncProgress.total) * 100)
        : 0;

      return {
        icon: <FaSync className="text-blue-500 animate-spin" />,
        text: `${syncProgress.currentAction} (${progressPercent}%)`,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200'
      };
    }

    if (pendingActions > 0) {
      return {
        icon: <FaExclamationTriangle className="text-orange-500" />,
        text: `${pendingActions} pending`,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        textColor: 'text-orange-800 dark:text-orange-200'
      };
    }

    return {
      icon: <FaCheckCircle className="text-green-500" />,
      text: 'Online',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} shadow-lg z-[9999] transition-all duration-300 ${className}`}>
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <span className={`text-sm font-medium ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Progress bar for sync */}
      {isSyncing && showSyncProgress && syncProgress.total > 0 && (
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{
              width: `${(syncProgress.completed / syncProgress.total) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;