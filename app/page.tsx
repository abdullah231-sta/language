"use client";

import Link from 'next/link';
import { FaUsers, FaGlobe, FaComments, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    // Welcome page for non-logged in users
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                LinguaConnect
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with language learners worldwide. Practice conversations, join study groups, 
              and accelerate your language learning journey with our global community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 min-h-[48px] flex items-center justify-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-gray-900 transition-all duration-200 min-h-[48px] flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-xl sm:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Join Groups</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Find language learning groups that match your interests and skill level. 
                Practice with native speakers and fellow learners.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-xl sm:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Live Conversations</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Engage in real-time conversations with people from around the world. 
                Improve your speaking and listening skills naturally.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGlobe className="text-xl sm:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Global Community</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Connect with learners from 190+ countries. Experience diverse cultures 
                while mastering new languages together.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl border border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Ready to start your language journey?
            </h2>
            <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
              Join thousands of learners already improving their language skills
            </p>
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 min-h-[48px]"
            >
              <span>Join Now</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for logged-in users
  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {user.username}! 👋
        </h1>
        <p className="text-blue-100 text-base sm:text-lg">
          Continue your {user.nativeLanguage} → {user.targetLanguages[0] || 'language learning'} journey
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          href="/groups"
          className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-200 group min-h-[80px] flex items-center"
        >
          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <FaUsers className="text-white text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base sm:text-lg">Browse Groups</h3>
              <p className="text-gray-400 text-sm sm:text-base">Find your perfect study group</p>
            </div>
          </div>
        </Link>

        <Link
          href="/messages"
          className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-200 group min-h-[80px] flex items-center"
        >
          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <FaComments className="text-white text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base sm:text-lg">Messages</h3>
              <p className="text-gray-400 text-sm sm:text-base">Chat with your language partners</p>
            </div>
          </div>
        </Link>

        <Link
          href="/profile"
          className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-200 group min-h-[80px] flex items-center"
        >
          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm sm:text-base">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base sm:text-lg">Profile</h3>
              <p className="text-gray-400 text-sm sm:text-base">Manage your account settings</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sm:p-8">
        <h2 className="text-white text-xl sm:text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaComments className="text-gray-500 text-xl sm:text-2xl" />
          </div>
          <p className="text-gray-400 text-base sm:text-lg mb-3 sm:mb-4">No recent activity yet</p>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            Start by joining a group or sending a message to see your activity here
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;