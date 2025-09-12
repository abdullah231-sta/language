// components/GroupCard.tsx
import Link from 'next/link'; // Import Link
import { FaUsers, FaGlobe } from 'react-icons/fa';

interface GroupCardProps {
  id: number; // Add id prop
  name: string;
  language: string;
  memberCount: number;
  description: string;
}

const GroupCard = ({ id, name, language, memberCount, description }: GroupCardProps) => {
  return (
    // Wrap the entire card in a Link component
    <Link href={`/groups/${id}`}>
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full hover:shadow-lg transition cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
            <FaGlobe className="mr-1.5" /> {language}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <FaUsers className="mr-2" />
            <span>{memberCount} members</span>
          </div>
          {/* Add e.preventDefault() to stop the Link from firing when the button is clicked */}
          <button 
            onClick={(e) => {
              e.preventDefault(); 
              alert(`Joining ${name}...`);
            }} 
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition z-10"
          >
            Join Group
          </button>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;