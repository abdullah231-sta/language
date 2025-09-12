// components/MemberAvatar.tsx

import { FaCrown, FaPlus } from 'react-icons/fa';

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string;
  isHost?: boolean;
  isInvite?: boolean;
}

const MemberAvatar = ({ name, avatarUrl, isHost = false, isInvite = false }: MemberAvatarProps) => {
  // If this is the "Invite" button
  if (isInvite) {
    return (
      <div className="flex flex-col items-center text-center">
        <button className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-2 hover:bg-gray-600 transition">
          <FaPlus className="text-gray-400 text-2xl" />
        </button>
        <p className="font-semibold text-gray-300">{name}</p>
      </div>
    );
  }

  // If this is a regular user
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-20 h-20 mb-2">
        <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover border-2 border-gray-600" />
        {isHost && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 p-1 rounded-full">
            <FaCrown className="text-white text-xs" />
          </div>
        )}
      </div>
      <p className="font-semibold text-gray-200 truncate w-20">{name}</p>
    </div>
  );
};

export default MemberAvatar;