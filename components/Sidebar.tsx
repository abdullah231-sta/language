"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MobileButton } from './MobileOptimized';
import { 
  FaHome, 
  FaUsers, 
  FaComments, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaBars,
  FaTimes,
  FaGlobe
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/', icon: FaHome, label: 'Home' },
    { href: '/groups', icon: FaUsers, label: 'Groups' },
    { href: '/messages', icon: FaComments, label: 'Messages' },
    { href: '/profile', icon: FaUser, label: 'Profile' },
    { href: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileButton
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-4 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
      >
        {isMobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
      </MobileButton>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 z-40 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-72 lg:w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaGlobe className="text-white text-xl" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  LinguaConnect
                </h1>
              </div>
            )}
          </div>
          
          {/* Collapse Button (Desktop Only) */}
          <MobileButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block absolute -right-3 top-8 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
          >
            <FaBars className="text-xs" />
          </MobileButton>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3 min-h-[48px]">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-base">{user.username}</p>
                <p className="text-gray-400 text-sm truncate">
                  {user.nativeLanguage} → {user.targetLanguages[0] || 'Learning'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-200 group min-h-[48px]
                      ${active 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`text-xl ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    {!isCollapsed && (
                      <span className="font-medium text-base">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <MobileButton
            onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-200 min-h-[48px]
              text-red-400 hover:bg-red-600/20 hover:text-red-300
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <FaSignOutAlt className="text-xl" />
            {!isCollapsed && <span className="font-medium text-base">Logout</span>}
          </MobileButton>
        </div>
      </div>
    </>
  );
};

export default Sidebar;