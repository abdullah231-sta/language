// app/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. IMPORT the useRouter hook
import GroupCard from '@/components/GroupCard';
import CreateGroupModal, { GroupData } from '@/components/modals/CreateGroupModal';
import { FaPlus } from 'react-icons/fa';

const initialGroups = [
  { id: 1, name: 'Japanese Beginners Club', language: 'Japanese', memberCount: 128, description: 'A friendly group for absolute beginners to practice basic greetings and phrases.' },
  { id: 2, name: 'English Daily Conversation', language: 'English', memberCount: 452, description: 'Practice your daily English speaking skills with native speakers. All levels welcome!' },
  { id: 3, name: 'Spanish Film Fans', language: 'Spanish', memberCount: 76, description: 'Let\'s watch Spanish movies together and discuss them to improve our listening.' },
  { id: 4, name: 'Arabic Calligraphy & Art', language: 'Arabic', memberCount: 45, description: 'A creative space to share and discuss the art of Arabic calligraphy.' },
];

const HomePage = () => {
  const [groups, setGroups] = useState(initialGroups);
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter(); // <-- 2. INITIALIZE the router

  // This function receives the data from the modal
  const handleCreateGroup = (groupData: GroupData) => {
    const newGroup = {
      ...groupData,
      id: Date.now(), // Generate a unique ID
      memberCount: 1, // The creator is the first member
    };
    
    // Add the new group to the beginning of the list
    setGroups([newGroup, ...groups]);
    
    // 3. NAVIGATE to the new group's page immediately
    router.push(`/groups/${newGroup.id}`);
  };

  return (
    <>
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Find a Group</h1>
          <button onClick={() => setModalOpen(true)} className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition" aria-label="Create new group">
            <FaPlus />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map(group => (
            <GroupCard 
              key={group.id}
              id={group.id}
              name={group.name}
              language={group.language}
              memberCount={group.memberCount}
              description={group.description}
            />
          ))}
        </div>
      </div>
      
      <CreateGroupModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </>
  );
};

export default HomePage;