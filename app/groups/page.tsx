"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaSearch, FaFilter, FaPlus, FaGlobe, FaComments, FaStar } from 'react-icons/fa';
import { getFlagEmoji } from '@/utils/flags';

interface Group {
  id: number;
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
  isPopular?: boolean;
  lastActive: string;
}

const mockGroups: Group[] = [
  {
    id: 1,
    name: 'English Daily Conversation',
    language: 'English',
    targetLanguage: 'English',
    memberCount: 452,
    activeNow: 12,
    description: 'Practice your daily English speaking skills with native speakers. All levels welcome!',
    level: 'Beginner',
    category: 'Conversation',
    owner: { name: 'Sarah Johnson', nationality: 'US' },
    isPopular: true,
    lastActive: '2 minutes ago'
  },
  {
    id: 2,
    name: 'Japanese Beginners Club',
    language: 'Japanese',
    targetLanguage: 'Japanese',
    memberCount: 128,
    activeNow: 8,
    description: 'A friendly group for absolute beginners to practice basic greetings and phrases.',
    level: 'Beginner',
    category: 'Study Group',
    owner: { name: 'Takeshi Yamamoto', nationality: 'JP' },
    lastActive: '5 minutes ago'
  },
  {
    id: 3,
    name: 'Spanish Film Discussion',
    language: 'Spanish',
    targetLanguage: 'Spanish',
    memberCount: 76,
    activeNow: 4,
    description: 'Watch Spanish movies together and discuss them to improve listening skills.',
    level: 'Intermediate',
    category: 'Entertainment',
    owner: { name: 'Carlos Rodriguez', nationality: 'ES' },
    lastActive: '15 minutes ago'
  },
  {
    id: 4,
    name: 'French Business Language',
    language: 'French',
    targetLanguage: 'French',
    memberCount: 234,
    activeNow: 15,
    description: 'Professional French for business meetings, presentations, and networking.',
    level: 'Advanced',
    category: 'Professional',
    owner: { name: 'Marie Dubois', nationality: 'FR' },
    isPopular: true,
    lastActive: '1 minute ago'
  },
  {
    id: 5,
    name: 'German Grammar Workshop',
    language: 'German',
    targetLanguage: 'German',
    memberCount: 89,
    activeNow: 6,
    description: 'Focus on German grammar rules, exercises, and practical applications.',
    level: 'Intermediate',
    category: 'Grammar',
    owner: { name: 'Hans Mueller', nationality: 'DE' },
    lastActive: '8 minutes ago'
  },
  {
    id: 6,
    name: 'Korean Pop Culture Chat',
    language: 'Korean',
    targetLanguage: 'Korean',
    memberCount: 312,
    activeNow: 22,
    description: 'Discuss K-pop, K-dramas, and Korean culture while practicing the language.',
    level: 'Beginner',
    category: 'Culture',
    owner: { name: 'Park Min-jun', nationality: 'KR' },
    isPopular: true,
    lastActive: 'Active now'
  }
];

const GroupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allGroups, setAllGroups] = useState<Group[]>(mockGroups);
  const router = useRouter();

  // Load user-created groups from localStorage on component mount
  useEffect(() => {
    const userCreatedGroups = JSON.parse(localStorage.getItem('userCreatedGroups') || '[]');
    if (userCreatedGroups.length > 0) {
      setAllGroups([...userCreatedGroups, ...mockGroups]);
    }
  }, []);

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

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
        <p className="text-gray-400">
          Showing {filteredGroups.length} of {allGroups.length} groups
        </p>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <div key={group.id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-200 overflow-hidden group cursor-pointer"
               onClick={() => router.push(`/groups/${group.id}`)}>
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {group.name}
                  </h3>
                  {group.isPopular && (
                    <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <FaStar className="text-xs" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl">
                  {getFlagEmoji(group.owner.nationality)}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {group.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {group.language}
                </span>
                <span className={`${getLevelColor(group.level)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                  {group.level}
                </span>
                <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                  {group.category}
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <FaUsers className="text-xs" />
                    <span>{group.memberCount}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{group.activeNow} active</span>
                  </div>
                </div>
                <div className="text-gray-500 text-xs">
                  {group.lastActive}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-gray-400 text-xs">
                  by {group.owner.name}
                </div>
                <Link
                  href={`/groups/${group.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Group
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
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