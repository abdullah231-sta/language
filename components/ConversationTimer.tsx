"use client";

import React, { useState } from 'react';
import { useConversationTime } from '@/context/ConversationTimeContext';
import { FaClock, FaPlay, FaPause, FaStop, FaChartLine, FaTimes } from 'react-icons/fa';

interface ConversationTimerProps {
  className?: string;
  showStats?: boolean;
}

export const ConversationTimer: React.FC<ConversationTimerProps> = ({ 
  className = '', 
  showStats = false 
}) => {
  const { timeData, pauseSession, resumeSession, endSession, formatTime, getTodayStats, getWeekStats } = useConversationTime();
  const [showStatsModal, setShowStatsModal] = useState(false);

  const todayStats = getTodayStats();
  const weekStats = getWeekStats();

  if (!timeData.sessionStart) {
    return null;
  }

  return (
    <>
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaClock className={`text-sm ${timeData.isActive ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className="text-white font-mono text-sm">
                {formatTime(timeData.sessionDuration)}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              timeData.isActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`} />
          </div>
          
          <div className="flex items-center gap-2">
            {showStats && (
              <button
                onClick={() => setShowStatsModal(true)}
                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                title="View Stats"
              >
                <FaChartLine className="text-sm" />
              </button>
            )}
            
            <button
              onClick={timeData.isActive ? pauseSession : resumeSession}
              className={`${
                timeData.isActive 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-green-400 hover:text-green-300'
              } transition-colors p-1`}
              title={timeData.isActive ? 'Pause' : 'Resume'}
            >
              {timeData.isActive ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
            </button>
            
            <button
              onClick={endSession}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
              title="End Session"
            >
              <FaStop className="text-sm" />
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          {timeData.isActive ? 'Recording conversation time...' : 'Session paused'}
        </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Conversation Stats</h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Current Session */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Current Session</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white font-mono">{formatTime(timeData.sessionDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`font-medium ${
                      timeData.isActive ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {timeData.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Today's Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{todayStats.sessions}</div>
                    <div className="text-gray-300 text-sm">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{formatTime(todayStats.totalTime)}</div>
                    <div className="text-gray-300 text-sm">Total Time</div>
                  </div>
                </div>
              </div>

              {/* Weekly Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">This Week</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Time:</span>
                    <span className="text-white font-mono">{formatTime(weekStats.totalTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Current Streak:</span>
                    <span className="text-orange-400 font-bold">{timeData.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Longest Streak:</span>
                    <span className="text-purple-400 font-bold">{timeData.longestStreak} days</span>
                  </div>
                </div>
              </div>

              {/* All Time Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">All Time</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{formatTime(timeData.allTimeTotal)}</div>
                  <div className="text-gray-300 text-sm">Total Practice Time</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationTimer;