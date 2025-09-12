// components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
// Import the new icon
import { FaHome, FaCog, FaSearch, FaRegQuestionCircle, FaEnvelope } from 'react-icons/fa';

const Sidebar = () => {
  const { username, avatar } = useUser();

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-900 text-gray-300">
      {/* User Profile Section... */}
      <div className="flex flex-col items-center mb-6">
        {avatar ? (
          <img src={avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover mb-2" />
        ) : (
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-3xl mb-2">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        <h4 className="font-semibold text-white text-lg">{username}</h4>
      </div>
      <div className="w-full border-t border-gray-700 mb-4" />
      <div className="flex flex-col justify-between flex-1">
        <nav>
          <Link href="/" className="flex items-center px-4 py-2 rounded-md hover:bg-gray-700">
            <FaHome className="w-5 h-5" />
            <span className="mx-4 font-medium">Home</span>
          </Link>
          <Link href="#" className="flex items-center px-4 py-2 mt-5 rounded-md hover:bg-gray-700">
            <FaSearch className="w-5 h-5" />
            <span className="mx-4 font-medium">Search</span>
          </Link>
          {/* ADD THE NEW MESSAGES LINK HERE */}
          <Link href="/messages" className="flex items-center px-4 py-2 mt-5 rounded-md hover:bg-gray-700">
            <FaEnvelope className="w-5 h-5" />
            <span className="mx-4 font-medium">Messages</span>
          </Link>
          <Link href="#" className="flex items-center px-4 py-2 mt-5 rounded-md hover:bg-gray-700">
            <FaRegQuestionCircle className="w-5 h-5" />
            <span className="mx-4 font-medium">Ask</span>
          </Link>
        </nav>
        <div>
          <div className="w-full border-t border-gray-700" />
          <Link href="/settings" className="flex items-center px-4 py-3 mt-3 rounded-md hover:bg-gray-700">
            <FaCog className="w-5 h-5" />
            <span className="mx-4 font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;