// app/groups/[groupId]/page.tsx
"use client";

import { FaComment, FaGift, FaHeadphones, FaRegSmile, FaSignOutAlt } from 'react-icons/fa';
import MemberAvatar from '@/components/MemberAvatar';

// Let's create more detailed fake data for this page
const getGroupData = (groupId: string) => {
  return {
    id: 1,
    name: 'Amrita thakur',
    language: 'English Beginner',
    hosts: [
      { name: 'Amrita', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop' },
      { name: 'Ronan', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop' },
    ],
    listeners: [
      { name: 'Riven', avatarUrl: 'https://images.unsplash.com/photo-1516733232583-3f9b06881a7b?w=500&auto=format&fit=crop' },
    ],
  };
}

const GroupPage = ({ params }: { params: { groupId: string } }) => {
  const groupData = getGroupData(params.groupId);

  if (!groupData) {
    return <div>Group not found.</div>;
  }

  return (
    // Main container with a dark theme and full height
    <div className="flex flex-col h-screen bg-gray-800 text-white font-sans">
      
      {/* 1. HEADER */}
      <div className="p-4 shadow-md bg-gray-800 z-10">
        <div className="flex justify-between items-center">
          <button className="flex items-center text-red-400 font-bold hover:text-red-300">
            <FaSignOutAlt className="mr-2 transform rotate-180" /> Leave
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold">{groupData.name}</h1>
            <span className="text-sm bg-gray-700 px-3 py-1 rounded-full mt-1 inline-block">{groupData.language}</span>
          </div>
          {/* A placeholder for the right side to keep alignment */}
          <div className="w-16"></div>
        </div>
      </div>

      {/* 2. MEMBER GRID */}
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4">
          {/* Render Hosts */}
          {groupData.hosts.map(host => (
            <MemberAvatar key={host.name} name={host.name} avatarUrl={host.avatarUrl} isHost />
          ))}

          {/* Render "Invite" Button */}
          <MemberAvatar name="Invite" isInvite />

          {/* Render Listeners */}
          {groupData.listeners.map(listener => (
            <MemberAvatar key={listener.name} name={listener.name} avatarUrl={listener.avatarUrl} />
          ))}
        </div>
        
        {/* Section Title */}
        <p className="text-gray-400 font-semibold mt-8 ml-2">Listen only</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4 mt-4">
           {/* You could map over more listeners here */}
        </div>
      </div>

      {/* 3. FOOTER ACTION BAR */}
      <div className="p-4 bg-gray-900 shadow-inner mt-auto">
        <div className="flex justify-around items-center">
          <button className="text-gray-400 hover:text-white"><span className="text-2xl">...</span></button>
          <button className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600"><FaHeadphones className="text-2xl" /></button>
          <button className="text-gray-400 hover:text-white"><FaGift className="text-2xl" /></button>
          <button className="text-gray-400 hover:text-white"><FaComment className="text-2xl" /></button>
          <button className="text-gray-400 hover:text-white"><FaRegSmile className="text-2xl" /></button>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;