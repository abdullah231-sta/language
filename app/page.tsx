"use client";

import Link from 'next/link';
import { FaUsers, FaGlobe, FaComments, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    // Welcome page for non-logged in users
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex justify-between items-center p-6 lg:px-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FaGlobe className="text-white text-sm" />
              </div>
              <span className="text-white font-bold text-lg">LinguaConnect</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                <span className="text-sm text-gray-300">🌟 Join 10,000+ language learners worldwide</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Master Languages Through
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  Real Conversations
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Break language barriers with native speakers. Join immersive conversations,
                cultural exchanges, and accelerate your fluency with our global community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/register"
                  className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2 min-w-[200px] justify-center"
                >
                  <span>Start Learning Free</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm min-w-[200px] text-center"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">50+</div>
                  <div className="text-sm text-gray-400">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">10K+</div>
                  <div className="text-sm text-gray-400">Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">190+</div>
                  <div className="text-sm text-gray-400">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white/5 backdrop-blur-sm border-y border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Why Choose LinguaConnect?
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Experience language learning like never before with our innovative platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="group text-center p-6 rounded-2xl hover:bg-white/5 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FaUsers className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Expert-Led Groups</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Join curated study groups led by experienced language tutors and native speakers.
                    Learn at your own pace with personalized guidance.
                  </p>
                </div>

                <div className="group text-center p-6 rounded-2xl hover:bg-white/5 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FaComments className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Live Conversations</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Practice real-time conversations with native speakers from around the world.
                    Build confidence and fluency through authentic interactions.
                  </p>
                </div>

                <div className="group text-center p-6 rounded-2xl hover:bg-white/5 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FaGlobe className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Global Community</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Connect with learners from 190+ countries. Experience diverse cultures,
                    exchange knowledge, and make lifelong friends worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-8 lg:p-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Language Journey?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of learners who are already speaking new languages fluently.
                  Start your adventure today with our free trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2"
                  >
                    <span>Start Your Journey</span>
                    <FaArrowRight />
                  </Link>
                  <div className="text-gray-400 text-sm flex items-center justify-center space-x-2">
                    <span>✨</span>
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                    <FaGlobe className="text-white text-xs" />
                  </div>
                  <span className="text-white font-semibold">LinguaConnect</span>
                </div>
                <div className="text-gray-400 text-sm">
                  © 2025 LinguaConnect. Connecting language learners worldwide.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Dashboard for logged-in users
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
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