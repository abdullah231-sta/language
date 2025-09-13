"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { MobileButton } from './MobileOptimized';
import { 
  FaHome, 
  FaUsers, 
  FaComments, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

interface User {
  id: string;
  username: string;
  email: string;
  nationality: string;
  nativeLanguage: string;
  targetLanguage: string;
}

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Groups', href: '/groups', icon: FaUsers },
    { name: 'Messages', href: '/messages', icon: FaComments },
    { name: 'Profile', href: '/profile', icon: FaUser },
    { name: 'Settings', href: '/settings', icon: FaCog },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900/95 dark:bg-gray-900/95 bg-white/95 backdrop-blur-sm border-b border-gray-700 dark:border-gray-700 border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌍</span>
            </div>
            <span className="text-white dark:text-white text-gray-900 text-xl font-bold">LinguaConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notification Bell */}
            {currentUser && <NotificationBell />}
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="text-white font-medium">{currentUser.username}</div>
                    <div className="text-gray-400 text-xs">
                      {currentUser.nativeLanguage} → {currentUser.targetLanguage}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <MobileButton
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </MobileButton>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <MobileButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 p-2 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </MobileButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {currentUser ? (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="text-white font-medium">{currentUser.username}</div>
                      <div className="text-gray-400 text-xs">{currentUser.email}</div>
                    </div>
                  </div>
                  <MobileButton
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 w-full"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </MobileButton>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;