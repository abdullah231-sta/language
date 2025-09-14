// components/GroupCard.tsx
import { useState, useCallback, memo } from 'react';
import { FaUsers, FaGlobe, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface GroupCardProps {
  id: string;
  name: string;
  language: string;
  memberCount: number;
  description: string;
  isJoined?: boolean;
  ownerId?: string;
  onJoinSuccess?: () => void;
}

const GroupCard = memo(({ id, name, language, memberCount, description, isJoined = false, ownerId, onJoinSuccess }: GroupCardProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Check if current user is the owner of this group
  const isOwner = user?.id === ownerId;
  
  // Determine what button to show
  const getButtonContent = () => {
    if (!isAuthenticated || !user) {
      return {
        text: 'Login to Join',
        disabled: true,
        className: 'opacity-50 cursor-not-allowed'
      };
    }
    
    if (isOwner) {
      return {
        text: 'Manage Group',
        disabled: false,
        className: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
      };
    }
    
    if (isJoined) {
      return {
        text: 'View Group',
        disabled: false,
        className: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
      };
    }
    
    return {
      text: 'Join Group',
      disabled: false,
      className: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    };
  };
  
  const buttonContent = getButtonContent();

  const handleJoinGroup = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      showToast('Please log in to join groups', 'error');
      return;
    }
    
    // If user is owner or already joined, navigate to group page
    if (isOwner || isJoined) {
      window.location.href = `/groups/${id}`;
      return;
    }
    
    setIsJoining(true);
    
    try {
      const requestBody = {
        groupId: id,
        userId: user.id,
        action: 'join'
      };
      
      console.log('Sending join request:', requestBody);
      
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group');
      }

      showToast('Successfully joined the group!', 'success');
      onJoinSuccess?.();
      
      // Navigate to the group page after joining
      setTimeout(() => {
        window.location.href = `/groups/${id}`;
      }, 1000);
      
    } catch (error) {
      console.error('Error joining group:', error);
      showToast(error instanceof Error ? error.message : 'Failed to join group', 'error');
    } finally {
      setIsJoining(false);
    }
  }, [id, isAuthenticated, user, showToast, onJoinSuccess, isOwner, isJoined]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Only navigate if the click didn't come from the join button
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return; // Don't navigate if clicking on a button
    }
    
    // Navigate to group page for viewing only (not joining)
    window.location.href = `/groups/${id}?view=true`;
  }, [id]);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 flex flex-col h-full hover:shadow-xl hover:scale-105 transform transition-all duration-300 border border-gray-100 dark:border-gray-700 group active:scale-100 touch-manipulation"
    >
        {/* Header */}
        <div className="flex justify-between items-start mb-3 gap-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
            {name}
          </h3>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center whitespace-nowrap flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
            <FaGlobe className="mr-1 sm:mr-1.5 text-xs" /> 
            <span className="hidden sm:inline">{language}</span>
            <span className="sm:hidden">{language.substring(0, 3)}</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
          {description}
        </p>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            <FaUsers className="mr-2" />
            <span className="font-medium">{memberCount.toLocaleString()} members</span>
          </div>
          
          <button 
            onClick={handleJoinGroup}
            disabled={isJoining || buttonContent.disabled}
            className={`px-4 py-2.5 text-white text-sm font-semibold rounded-lg active:scale-95 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg min-w-[100px] flex items-center justify-center touch-manipulation order-1 sm:order-2 w-full sm:w-auto ${
              buttonContent.className
            }`}
          >
            {isJoining ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>Joining...</span>
              </div>
            ) : (
              buttonContent.text
            )}
          </button>
        </div>
    </div>
  );
});

GroupCard.displayName = 'GroupCard';

export default GroupCard;