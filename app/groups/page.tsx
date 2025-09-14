"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaSearch, FaFilter, FaPlus, FaGlobe, FaComments, FaStar } from 'react-icons/fa';
import { getFlagEmoji } from '@/utils/flags';
import { useAuth } from '@/context/AuthContext';
import GroupCard from '@/components/GroupCard';

interface Group {
  id: string;
  name: string;
  language: string;
  targetLanguage: string;
  memberCount: number;
  activeNow: number;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  owner: {
    name: string;
    nationality: string;
  };
  ownerId: string;
  isPopular?: boolean;
  lastActive: string;
  isJoined?: boolean;
}

const GroupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Load groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      if (!isAuthenticated || !user) {
        setError('Please log in to view groups');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch('/api/groups', {
          headers: {
            'User-ID': user.id, // Pass user ID for membership checking
          },
        });
        const data = await response.json();
        
        if (data.success && data.groups) {
          // Transform API data to match the Group interface
          const transformedGroups = data.groups.map((group: any) => ({
            id: group.id,
            name: group.name,
            language: group.language,
            targetLanguage: group.language,
            memberCount: group.group_members?.[0]?.count || 0,
            activeNow: Math.floor(Math.random() * Math.min((group.group_members?.[0]?.count || 0), 20)),
            description: group.description || 'No description provided',
            level: 'Beginner' as const,
            category: 'Conversation',
            owner: {
              name: group.users?.username || 'Unknown',
              nationality: group.users?.nationality || 'US'
            },
            ownerId: group.ownerId, // Add owner ID for ownership checking
            isPopular: (group.group_members?.[0]?.count || 0) > 100,
            lastActive: new Date(group.updatedAt).toLocaleString(),
            isJoined: group.isJoined || false
          }));
          
          setAllGroups(transformedGroups);
          setError(null);
        } else {
          console.error('Failed to fetch groups:', data.error);
          setError('Failed to load groups');
          setAllGroups([]);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to connect to server');
        setAllGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [isAuthenticated, user]);

  // Refresh groups when someone joins
  const handleJoinSuccess = () => {
    // Refresh the groups list to get updated member counts
    setLoading(true);
    const fetchGroups = async () => {
      if (!isAuthenticated || !user) {
        setError('Please log in to view groups');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/groups', {
          headers: {
            'User-ID': user.id,
          },
        });
        const data = await response.json();
        
        if (data.success && data.groups) {
          const transformedGroups = data.groups.map((group: any) => ({
            id: group.id,
            name: group.name,
            language: group.language,
            targetLanguage: group.language,
            memberCount: group.group_members?.[0]?.count || 0,
            activeNow: Math.floor(Math.random() * Math.min((group.group_members?.[0]?.count || 0), 20)),
            description: group.description || 'No description provided',
            level: 'Beginner' as const,
            category: 'Conversation',
            owner: {
              name: group.users?.username || 'Unknown',
              nationality: group.users?.nationality || 'US'
            },
            isPopular: (group.group_members?.[0]?.count || 0) > 100,
            lastActive: new Date(group.updatedAt).toLocaleString(),
            isJoined: group.isJoined || false
          }));
          
          setAllGroups(transformedGroups);
        }
      } catch (error) {
        console.error('Error refreshing groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  };

  const languages = ['English', 'Japanese', 'Spanish', 'French', 'German', 'Korean'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const categories = ['Conversation', 'Study Group', 'Entertainment', 'Professional', 'Grammar', 'Culture'];

  const filteredGroups = allGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !selectedLanguage || group.language === selectedLanguage;
    const matchesLevel = !selectedLevel || group.level === selectedLevel;
    const matchesCategory = !selectedCategory || group.category === selectedCategory;
    
    return matchesSearch && matchesLanguage && matchesLevel && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Discover Language Groups</h1>
            <p className="text-gray-400">Join conversations with learners from around the world</p>
          </div>
          <button
            onClick={() => router.push('/groups/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 md:px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <FaPlus className="text-sm" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex flex-col gap-6">
            {/* Search Input */}
            <div className="relative w-full lg:w-1/2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Filter Boxes - Vertical Stack as Visual Cards */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              {/* Language Filter Box */}
              <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaGlobe className="inline mr-2" />
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter Box */}
              <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaStar className="inline mr-2" />
                  Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter Box */}
              <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaFilter className="inline mr-2" />
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedLanguage || selectedLevel || selectedCategory || searchTerm) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedLanguage('');
                    setSelectedLevel('');
                    setSelectedCategory('');
                    setSearchTerm('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        {loading ? (
          <p className="text-gray-400">Loading groups...</p>
        ) : error ? (
          <p className="text-red-400">⚠️ {error}</p>
        ) : (
          <p className="text-gray-400">
            Showing {filteredGroups.length} of {allGroups.length} groups
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded mb-4 w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Unable to load groups from server</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Groups Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              language={group.language}
              memberCount={group.memberCount}
              description={group.description}
              isJoined={group.isJoined}
              ownerId={group.ownerId}
              onJoinSuccess={handleJoinSuccess}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredGroups.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUsers className="text-4xl text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No groups found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search criteria or create a new group.</p>
          <button
            onClick={() => router.push('/groups/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Create New Group
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;