"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MobileButton } from './MobileOptimized';
import { 
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
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
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <MobileButton
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-4 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
        >
          {isMobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </MobileButton>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className="h-full w-full flex flex-col"
        style={{transform: isMobileOpen ? 'translateX(0)' : '', transition: 'transform 0.3s ease-in-out'}}
      >
        {/* Logo Section */}
        <div className="py-6 border-b border-gray-700 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FaGlobe className="text-white text-xl" />
          </div>
        </div>

        {/* User Profile Section */}
        <div className="py-4 border-b border-gray-700 flex flex-col items-center">
          <div className="flex items-center justify-center min-h-[48px]">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4">
          <ul className="space-y-6 flex flex-col items-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center justify-center p-3 rounded-lg transition-all duration-200 group min-h-[40px] min-w-[40px]
                      ${active 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                    title={item.label}
                  >
                    <Icon className={`text-xl ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="py-4 border-t border-gray-700 flex items-center justify-center">
          <MobileButton
            onClick={handleLogout}
            className={`
              flex items-center justify-center p-3 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px]
              text-red-400 hover:bg-red-600/20 hover:text-red-300
            `}
          >
            <FaSignOutAlt className="text-xl" title="Logout" />
          </MobileButton>
        </div>
      </div>
    </>
  );
};

export default Sidebar;