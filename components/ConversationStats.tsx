"use client";

import React, { useState } from 'react';
import { useConversationTime } from '@/context/ConversationTimeContext';
import { FaClock, FaCalendarDay, FaCalendarWeek, FaFire, FaTrophy, FaChartLine, FaInfoCircle } from 'react-icons/fa';

interface ConversationStatsProps {
  className?: string;
  compact?: boolean;
  showModal?: boolean;
}

export const ConversationStats: React.FC<ConversationStatsProps> = ({ 
  className = '',
  compact = false,
  showModal = false
}) => {
  const { timeData, formatTime, getTodayStats, getWeekStats } = useConversationTime();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const todayStats = getTodayStats();
  const weekStats = getWeekStats();

  const averageDailyTime = weekStats.totalTime > 0 ? Math.round(weekStats.totalTime / 7) : 0;
  const averageSessionTime = todayStats.sessions > 0 ? Math.round(todayStats.totalTime / todayStats.sessions) : 0;

  if (compact) {
    // Compact version for profile pages
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FaClock className="text-blue-400 text-sm" />
            </div>
            <h3 className="text-white font-semibold">Talk Time</h3>
          </div>
          {showModal && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <FaInfoCircle className="text-sm" />
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{formatTime(todayStats.totalTime)}</div>
            <div className="text-gray-400 text-xs">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{formatTime(weekStats.totalTime)}</div>
            <div className="text-gray-400 text-xs">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">{timeData.currentStreak}</div>
            <div className="text-gray-400 text-xs">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-400">{formatTime(timeData.allTimeTotal)}</div>
            <div className="text-gray-400 text-xs">All Time</div>
          </div>
        </div>

        {/* Modal for detailed stats */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detailed Talk Time Statistics</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    label: "Today's Practice",
                    value: formatTime(todayStats.totalTime),
                    icon: FaCalendarDay,
                    color: "text-blue-400",
                    bgColor: "bg-blue-500/10"
                  },
                  {
                    label: "Sessions Today",
                    value: todayStats.sessions.toString(),
                    icon: FaClock,
                    color: "text-green-400",
                    bgColor: "bg-green-500/10"
                  },
                  {
                    label: "Weekly Total",
                    value: formatTime(weekStats.totalTime),
                    icon: FaCalendarWeek,
                    color: "text-purple-400",
                    bgColor: "bg-purple-500/10"
                  },
                  {
                    label: "Current Streak",
                    value: `${timeData.currentStreak} days`,
                    icon: FaFire,
                    color: "text-orange-400",
                    bgColor: "bg-orange-500/10"
                  },
                  {
                    label: "Longest Streak",
                    value: `${timeData.longestStreak} days`,
                    icon: FaTrophy,
                    color: "text-yellow-400",
                    bgColor: "bg-yellow-500/10"
                  },
                  {
                    label: "All Time Total",
                    value: formatTime(timeData.allTimeTotal),
                    icon: FaChartLine,
                    color: "text-indigo-400",
                    bgColor: "bg-indigo-500/10"
                  }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className={`${stat.bgColor} rounded-lg p-4 border border-gray-700`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`text-sm ${stat.color}`} />
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                          <div className="text-gray-300 text-xs">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insights */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Insights</h3>
                
                {averageSessionTime > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">
                        Average session: <span className="text-white font-mono">{formatTime(averageSessionTime)}</span>
                      </span>
                    </div>
                  </div>
                )}

                {averageDailyTime > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">
                        Weekly average: <span className="text-white font-mono">{formatTime(averageDailyTime)}</span> per day
                      </span>
                    </div>
                  </div>
                )}

                {timeData.currentStreak >= 3 && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FaFire className="text-orange-400" />
                      <span className="text-orange-300 text-sm font-medium">
                        You&apos;re on fire! {timeData.currentStreak} days streak 🔥
                      </span>
                    </div>
                  </div>
                )}

                {todayStats.totalTime >= 1800 && ( // 30 minutes
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-green-400" />
                      <span className="text-green-300 text-sm font-medium">
                        Great job! You&apos;ve practiced for over 30 minutes today! 🎉
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full version (fallback, though we're primarily using compact now)
  const stats = [
    {
      label: "Today's Practice",
      value: formatTime(todayStats.totalTime),
      icon: FaCalendarDay,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Sessions Today",
      value: todayStats.sessions.toString(),
      icon: FaClock,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Weekly Total",
      value: formatTime(weekStats.totalTime),
      icon: FaCalendarWeek,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      label: "Current Streak",
      value: `${timeData.currentStreak} days`,
      icon: FaFire,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      label: "Longest Streak",
      value: `${timeData.longestStreak} days`,
      icon: FaTrophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "All Time Total",
      value: formatTime(timeData.allTimeTotal),
      icon: FaChartLine,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10"
    }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <FaChartLine className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Learning Analytics</h2>
          <p className="text-gray-400 text-sm">Track your conversation practice progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4 border border-gray-700`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`text-sm ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-300 text-xs">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress insights */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Today's Insights</h3>
        
        {averageSessionTime > 0 && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">
                Average session: <span className="text-white font-mono">{formatTime(averageSessionTime)}</span>
              </span>
            </div>
          </div>
        )}

        {averageDailyTime > 0 && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">
                Weekly average: <span className="text-white font-mono">{formatTime(averageDailyTime)}</span> per day
              </span>
            </div>
          </div>
        )}

        {timeData.currentStreak >= 3 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FaFire className="text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">
                You're on fire! {timeData.currentStreak} days streak 🔥
              </span>
            </div>
          </div>
        )}

        {todayStats.totalTime >= 1800 && ( // 30 minutes
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                Great job! You've practiced for over 30 minutes today! 🎉
              </span>
            </div>
          </div>
        )}

        {todayStats.sessions === 0 && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-gray-400 text-sm">
                Start a conversation to begin tracking your practice time today!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationStats;