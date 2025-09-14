// app/groups/[groupId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaComment, FaGift, FaHeadphones, FaRegSmile, FaSignOutAlt, FaUserPlus, FaTimes, FaCheck, FaUserMinus, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute, FaInfoCircle, FaImage, FaImages } from 'react-icons/fa';
import MemberAvatar from '@/components/MemberAvatar';
import { useUser } from '@/context/UserContext';
import { useMessaging } from '@/context/MessagingContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import InviteFriendsModal from '@/components/modals/InviteFriendsModal';
import EngagementRequestModal from '@/components/modals/EngagementRequestModal';
import ImageUploadModal from '@/components/modals/ImageUploadModal';
import ImageGalleryModal from '@/components/modals/ImageGalleryModal';
import GroupChat from '@/components/GroupChat';
import ConnectionStatus from '@/components/ConnectionStatus';
import VoiceButton from '@/components/VoiceButton';
import { VoiceProvider, useVoice } from '@/context/VoiceContext';
import { getFlagEmoji, getCountryName } from '@/utils/flags';
import { offlineManager, useNetworkStatus } from '@/lib/offline';

// TypeScript interfaces for real API data
interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isMuted: boolean;
  isOwner: boolean;
  nationality: string;
  nativeLanguage: string;
  targetLanguage: string;
  role: string;
  hasRequested?: boolean;
  requestedSeatPosition?: number;
}

interface GroupData {
  id: string;
  name: string;
  language: string;
  description: string;
  owner: User;
  tableSeats: Array<{
    position: number;
    user: User | null;
  }>;
  waitingUsers: User[];
  memberCount: number;
}

const GroupPage = ({ params }: { params: Promise<{ groupId: string }> | { groupId: string } }) => {
  // Handle both sync and async params for Next.js compatibility
  const [groupId, setGroupId] = useState<string>('');
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize context hooks first
  const { username, avatar, nationality, nativeLanguage, targetLanguage } = useUser();
  const { user, isAuthenticated } = useAuth();
  const { conversations, addMessage, getConversation } = useMessaging();
  const { showSuccess, showInfo, showWarning, showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnline } = useNetworkStatus();

  // Auto-join voice component
  const AutoJoinVoice = () => {
    const { autoJoinForTableUser } = useVoice();
    
    useEffect(() => {
      if (!groupData || !user?.id || !groupId) return;
      
      // Check if current user is sitting at table
      const isAtTable = groupData.tableSeats.some(seat => seat.user?.id === user.id);
      
      // Auto-join or leave voice based on table status
      autoJoinForTableUser(groupId, user.id, isAtTable);
    }, [groupData, user?.id, groupId, autoJoinForTableUser]);
    
    return null;
  };
  
  useEffect(() => {
    const getGroupId = async () => {
      const resolvedParams = await Promise.resolve(params);
      setGroupId(resolvedParams.groupId);
    };
    getGroupId();
  }, [params]);

  // Fetch real group data from API
  const fetchGroupData = async (isInitialLoad = false) => {
    if (!groupId) return;
    
    // Only show loading spinner on initial load, not on polling updates
    if (isInitialLoad) {
      setLoading(true);
    }
    
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      const data = await response.json();
      
      if (data.success) {
        setGroupData(data.group);
        setError(null);
      } else {
        console.error('Failed to fetch group data:', data.error);
        setError(data.error || 'Failed to load group data');
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setError('Failed to load group data');
    } finally {
      // Only set loading to false on initial load
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (groupId) {
      fetchGroupData(true); // Initial load with loading spinner
      // Set up polling for real-time updates (without loading spinner)
      const interval = setInterval(() => fetchGroupData(false), 5000);
      return () => clearInterval(interval);
    }
  }, [groupId, isAuthenticated]);


  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedListener, setSelectedListener] = useState<string | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [seatMuteStates, setSeatMuteStates] = useState<{ [position: number]: boolean }>({});
  const [showMessagingPanel, setShowMessagingPanel] = useState(false);
  const [messagingUser, setMessagingUser] = useState<{id: string, name: string, avatar: string} | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isJoiningAsListener, setIsJoiningAsListener] = useState(false);
  const [showJoinBanner, setShowJoinBanner] = useState(false);

  const [currentUserJoinRequest, setCurrentUserJoinRequest] = useState<number | null>(null);
  const [showOwnerLeaveModal, setShowOwnerLeaveModal] = useState(false);
  const [purpleCrownAdmins, setPurpleCrownAdmins] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  
  // Image sharing states
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showImageGalleryModal, setShowImageGalleryModal] = useState(false);
  const [groupImages, setGroupImages] = useState<any[]>([
    // Mock data for demonstration - in real app this would come from API
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800&auto=format&fit=crop',
      title: 'Learning Materials',
      description: 'Basic English conversation phrases for beginners',
      uploadedBy: {
        id: 'user-2',
        name: 'Sarah Kim',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c76c?w=500&auto=format&fit=crop'
      },
      uploadedAt: new Date('2024-01-15T10:30:00'),
      fileSize: 245760,
      fileName: 'english-phrases.jpg'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
      title: 'Grammar Chart',
      description: 'Common irregular verbs reference chart',
      uploadedBy: {
        id: 'user-1',
        name: username,
        avatarUrl: avatar
      },
      uploadedAt: new Date('2024-01-14T15:45:00'),
      fileSize: 512000,
      fileName: 'irregular-verbs.png'
    }
  ]);
  
  const handleCloseGroupPermanently = async () => {
    try {
      setShowOwnerLeaveModal(false);
      
      // Check authentication first
      if (!user || !user.id) {
        showError('You must be logged in to delete a group. Please log in and try again.');
        return;
      }
      
      showWarning('Closing group permanently...');

      console.log('Attempting to delete group:', {
        groupId,
        userId: user.id,
        username: user.username,
        userObject: user
      });

      const response = await fetch('/api/groups', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: groupId,
          ownerId: user.id
        }),
      });

      const data = await response.json();
      console.log('Delete response:', { status: response.status, data });

      if (!response.ok) {
        // Provide more specific error messages
        if (response.status === 403 || response.status === 401) {
          throw new Error('You are not the owner of this group or you do not have permission to delete it.');
        } else if (response.status === 404) {
          throw new Error('Group not found. It may have already been deleted.');
        } else {
          throw new Error(data.error || 'Failed to delete group');
        }
      }

      showSuccess('Group has been permanently deleted');
      router.push('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete group');
    }
  };

  const handleTransferOwnership = async () => {
    try {
      setShowOwnerLeaveModal(false);
      showInfo('Transferring ownership and leaving...');
      
      // For now, this is a placeholder since we'd need to implement
      // transfer ownership logic in the API
      showSuccess('Successfully left group. Ownership has been transferred.');
      router.push('/groups');
    } catch (error) {
      console.error('Error transferring ownership:', error);
      showError('Failed to transfer ownership. Please try again.');
    }
  };

  // Check if user is joining as listener
  useEffect(() => {
    const joinParam = searchParams.get('join');
    if (joinParam === 'listener') {
      setIsJoiningAsListener(true);
      setShowJoinBanner(true);
      // Only hide the banner after 3 seconds, but keep listener status
      setTimeout(() => {
        setShowJoinBanner(false);
      }, 3000);
    }
  }, [searchParams]);

  // Initialize offline functionality
  useEffect(() => {
    offlineManager.init().catch(error => {
      console.error('Failed to initialize offline functionality:', error);
    });
  }, []);

  // Get current user role and status from real API data
  const currentUserRole = groupData && user?.id 
    ? (() => {
        // Check if user is in table seats
        const tableUser = groupData.tableSeats.find(seat => seat.user?.id === user.id);
        if (tableUser && tableUser.user) {
          return tableUser.user.role;
        }
        // Check if user is in waiting area
        const waitingUser = groupData.waitingUsers.find(waitingUser => waitingUser.id === user.id);
        if (waitingUser) {
          return waitingUser.role || 'LISTENER';
        }
        return 'LISTENER';
      })()
    : 'LISTENER';
  
  const isOwner = groupData?.owner.id === user?.id && !isJoiningAsListener;
  const isListener = currentUserRole === 'LISTENER';
  const isParticipant = currentUserRole === 'PARTICIPANT';

  // Get join requests for notifications
  const activeJoinRequests = groupData?.waitingUsers.filter(u => u.hasRequested) || [];

  const handleKickUser = async (position: number, userId: string) => {
    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'kick_user',
          groupId: groupId,
          targetUserId: userId,
          requesterId: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess(data.message);
        // Refresh group data
        window.location.reload();
      } else {
        showError(data.error);
      }
    } catch (error) {
      console.error('Error kicking user:', error);
      showError('Failed to kick user');
    }
    setSelectedSeat(null);
  };

  const handleDemoteUser = async (position: number, userId: string) => {
    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'demote_user',
          groupId: groupId,
          targetUserId: userId,
          requesterId: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess(data.message);
        // Refresh group data
        window.location.reload();
      } else {
        showError(data.error);
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      showError('Failed to demote user');
    }
    setSelectedSeat(null);
  };

  const handleAcceptUser = async (userId: string) => {
    if (!groupData) return;
    
    // Find first empty seat and assign user to it
    const emptySeatIndex = groupData.tableSeats.findIndex((seat: { position: number; user: User | null }) => seat.user === null);
    if (emptySeatIndex !== -1) {
      try {
        const response = await fetch('/api/groups/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'promote_user',
            groupId: groupId,
            targetUserId: userId,
            seatPosition: emptySeatIndex,
            requesterId: user?.id
          }),
        });

        const data = await response.json();
        if (data.success) {
          showSuccess(data.message);
          // Refresh group data
          fetchGroupData(false);
        } else {
          showError(data.error);
        }
      } catch (error) {
        console.error('Error promoting user:', error);
        showError('Failed to promote user');
      }
    } else {
      showWarning('No empty seats available');
    }
    setSelectedListener(null);
  };

  const handleRejectUser = async (userId: string) => {
    // For now, just close the selection since we're not implementing join requests table yet
    showInfo('User request rejected');
    setSelectedListener(null);
  };

  const handleRequestToJoin = (userId: string) => {
    // In a real app, this would send a join request
    // In a real app, this would send a join request
    setSelectedListener(null);
  };

  const handleKickListener = async (userId: string) => {
    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'kick_user',
          groupId: groupId,
          targetUserId: userId,
          requesterId: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess(data.message);
        // Refresh group data
        window.location.reload();
      } else {
        showError(data.error);
      }
    } catch (error) {
      console.error('Error kicking listener:', error);
      showError('Failed to kick user');
    }
    setSelectedListener(null);
  };

  const handleShowUserInfo = (userId: string) => {
    setSelectedListener(userId);
    setShowUserInfo(true);
  };

  const handleMakePurpleCrownAdmin = async (userId: string, userName: string) => {
    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'grant_admin',
          groupId: groupId,
          targetUserId: userId,
          requesterId: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        showSuccess(`${userName} has been granted admin privileges!`);
        setPurpleCrownAdmins(prev => [...prev, userId]);
        // Refresh group data
        fetchGroupData(false);
      } else {
        showError(data.error);
      }
    } catch (error) {
      console.error('Error granting admin:', error);
      showError('Failed to grant admin privileges');
    }
    setSelectedSeat(null);
  };

  const handleRemovePurpleCrownAdmin = async (userId: string, userName: string) => {
    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'revoke_admin',
          groupId: groupId,
          targetUserId: userId,
          requesterId: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        showInfo(`${userName}'s admin privileges have been removed`);
        setPurpleCrownAdmins(prev => prev.filter(id => id !== userId));
        // Refresh group data
        fetchGroupData(false);
      } else {
        showError(data.error);
      }
    } catch (error) {
      console.error('Error revoking admin:', error);
      showError('Failed to revoke admin privileges');
    }
    setSelectedSeat(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !messagingUser) return;
    
    addMessage(messagingUser.id, messagingUser.name, messagingUser.avatar, 'Me', newMessage);
    setNewMessage('');
  };

  const handleListenerClick = (userId: string) => {
    if (isOwner) {
      setSelectedListener(selectedListener === userId ? null : userId);
    }
  };

  // Image handling functions
  const handleImageUpload = async (file: File) => {
    try {
      // In a real app, upload to your storage service (Supabase, AWS S3, etc.)
      const imageUrl = URL.createObjectURL(file);
      
      const newImage = {
        id: Date.now().toString(),
        url: imageUrl,
        title: file.name, // Use filename as title
        description: '', // No description for simplified sharing
        uploadedBy: {
          id: username || 'current-user',
          name: username || 'Current User',
          avatarUrl: avatar
        },
        uploadedAt: new Date(),
        fileSize: file.size,
        fileName: file.name
      };
      
      setGroupImages(prev => [newImage, ...prev]);
      console.log('Image uploaded:', newImage);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setGroupImages(prev => prev.filter(img => img.id !== imageId));
    console.log('Image deleted:', imageId);
  };

  const handleSeatClick = async (position: number) => {
    if (!user || !groupData) return;

    const seat = groupData.tableSeats[position];
    
    if (isOwner && seat.user && !seat.user.isOwner) {
      // Owner clicking on occupied seat (not their own) - show management options
      setSelectedSeat(selectedSeat === position ? null : position);
    } else if (isListener && !seat.user) {
      // Listener clicking on empty seat - request to join
      try {
        const response = await fetch('/api/groups/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'request_seat',
            groupId: groupData.id,
            requesterId: user.id,
            targetUserId: user.id,
            seatPosition: position
          }),
        });

        const data = await response.json();

        if (data.success) {
          showSuccess(`You requested Section ${position + 1}. Wait for approval from the group owner.`);
          fetchGroupData(false); // Refresh data to show request
        } else {
          showError(data.error || 'Failed to request seat');
        }
      } catch (error) {
        console.error('Error requesting seat:', error);
        showError('Failed to request seat');
      }
    }
  };

  const handleAcceptRequest = async (userId: string, seatPosition: number) => {
    if (!groupData || !isOwner) return;

    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept_join_request',
          groupId: groupData.id,
          requesterId: user?.id,
          targetUserId: userId,
          seatPosition: seatPosition
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Join request accepted');
        fetchGroupData(false); // Refresh data
      } else {
        showError(data.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      showError('Failed to accept request');
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!groupData || !isOwner) return;

    try {
      const response = await fetch('/api/groups/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject_join_request',
          groupId: groupData.id,
          requesterId: user?.id,
          targetUserId: userId
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Join request rejected');
        fetchGroupData(false); // Refresh data
      } else {
        showError(data.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showError('Failed to reject request');
    }
  };

  // Show loading if no groupData yet
  if (loading || !groupData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p>Loading group...</p>
        </div>
      </div>
    );
  }

  // Show error if failed to load
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => fetchGroupData(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <VoiceProvider>
      <AutoJoinVoice />
      <div className="flex flex-col h-screen bg-gray-800 text-white font-sans relative">
      {/* Group Chat Panel */}
      {showChat && (
        <div className="fixed left-0 top-0 bottom-0 z-40 w-80 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-gray-600">
          <GroupChat 
            groupId={groupId}
            groupName={groupData.name}
            isVisible={showChat}
            onToggle={() => setShowChat(!showChat)}
          />
        </div>
      )}

      {/* Join notification banner */}
      {showJoinBanner && (
        <div className="bg-green-600 text-white p-3 text-center font-medium">
          🎉 Welcome! You've joined as a listener. You can now hear the conversation and request to participate.
        </div>
      )}

      {/* Debug Info - Shows authentication status */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 mx-4 mt-2 rounded-lg">
        <p className="text-yellow-200 text-sm">
          <strong>Debug Info:</strong> {user ? `Logged in as ${user.username} (ID: ${user.id})` : 'Not logged in - Please log in to delete groups'}
        </p>
      </div>
      
      <div className="p-4 shadow-md bg-gray-800 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowChat(!showChat)}
              className="flex items-center text-green-400 hover:text-green-300 transition-colors"
              title="Toggle Chat"
            >
              <FaComment className="text-xl" />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">{groupData.name}</h1>
            <span className="text-sm bg-gray-700 px-3 py-1 rounded-full mt-1 inline-block">{groupData.language}</span>
            <div className="flex flex-col items-center gap-2 mt-2">
              <ConnectionStatus className="justify-center" />
              {/* Voice Button */}
              <VoiceButton 
                groupId={groupId} 
                userId={username || user?.username || 'anonymous'}
                className="scale-75"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Join request notification - visible to owner */}
            {isOwner && activeJoinRequests.length > 0 && (
              <div className="relative">
                <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold animate-pulse flex items-center gap-2">
                  <span>🙋‍♂️</span>
                  <span>{activeJoinRequests.length} seat request{activeJoinRequests.length > 1 ? 's' : ''}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
            )}
            <button 
              onClick={() => {
                if (isOwner) {
                  setShowOwnerLeaveModal(true);
                } else {
                  // Regular user leave - go to groups page
                  showInfo('Leaving group...');
                  setTimeout(() => {
                    showSuccess('Successfully left the group');
                    router.push('/groups');
                  }, 500);
                }
              }}
              className="flex items-center text-red-400 hover:text-red-300 transition-colors"
              title={isOwner ? "Leave/Close Group" : "Leave Group"}
            >
              <FaSignOutAlt className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-grow p-6 pt-12 overflow-y-auto transition-all duration-300 ${showChat ? 'ml-80' : ''} ${showMessagingPanel ? 'mr-80' : ''}`}>
        {/* User Sections - 10 sections arranged in grid */}
        <div className="mb-8 mt-16">
          {/* User grid */}
          <div className="max-w-4xl ml-8 relative">
            {/* Invite Friends Button - Positioned above Section 3 (3rd column) */}
            {isOwner && (
              <div className="absolute -top-16 left-[40%] transform -translate-x-1/2 z-10">
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg text-xs"
                  title="Invite Friends"
                >
                  <FaUserPlus className="text-xs" />
                  <span>Invite</span>
                </button>
                {/* Speaking emoji below invite button */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-lg">
                  🗣️
                </div>
              </div>
            )}
            <div className="grid grid-cols-5 gap-4">
              {groupData.tableSeats.map((seat) => (
                <div key={seat.position} className="relative flex flex-col items-center">
                  {seat.user ? (
                    <div 
                      onClick={() => {
                        if (seat.user) {
                          console.log('Clicked user:', seat.user.name, 'ID:', seat.user.id);
                          
                          if (isOwner && !seat.user.isOwner) {
                            // For owners: only show management options, don't show user info popup
                            setSelectedSeat(selectedSeat === seat.position ? null : seat.position);
                          } else if (!isOwner) {
                            // For non-owners: show user info directly
                            setSelectedListener(seat.user.id);
                            setShowUserInfo(true);
                          }
                        }
                      }}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedSeat === seat.position ? 'transform scale-105' : ''
                      }`}
                    >
                      <MemberAvatar 
                        name={seat.user.name} 
                        avatarUrl={seat.user.avatarUrl}
                        isOwner={seat.user.isOwner || false}
                        isPurpleCrownAdmin={purpleCrownAdmins.includes(seat.user.id)}
                        nationality={seat.user.nationality}
                        userId={seat.user.id}
                      />
                      {/* Mute indicator */}
                      {(seat.user.isMuted || seatMuteStates[seat.position]) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <FaVolumeMute className="text-xs text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleSeatClick(seat.position)}
                      className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-gray-500 relative ${
                        isListener 
                          ? 'border-blue-400 hover:border-blue-300 cursor-pointer hover:bg-blue-900/30 hover:text-blue-300' 
                          : 'border-gray-600'
                      }`}
                    >
                      <span className="text-xs">
                        {isListener ? 'Click to Request' : 'Empty'}
                      </span>
                    </div>
                  )}
                  
                  {/* Action buttons for owner */}
                  {isOwner && seat.user && !seat.user.isOwner && selectedSeat === seat.position && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 bg-gray-900 p-1 rounded-lg shadow-lg z-10">
                      <button 
                        onClick={() => handleDemoteUser(seat.position, seat.user?.id || '')}
                        className="bg-orange-600 text-white p-1 rounded text-xs hover:bg-orange-700 flex items-center gap-1"
                        title="Move to waiting area"
                      >
                        <FaUserMinus className="text-xs" />
                        <span className="text-xs">Demote</span>
                      </button>
                      <button 
                        onClick={() => handleKickUser(seat.position, seat.user?.id || '')}
                        className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700 flex items-center gap-1"
                        title="Kick from group"
                      >
                        <FaTimes className="text-xs" />
                        <span className="text-xs">Kick</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Section number */}
                  <div className="mt-2 text-xs text-gray-500">
                    Section {seat.position + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions for listeners */}
        {isListener && (
          <div className="mb-6 mx-4">
            <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
              <h3 className="text-blue-200 font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">ℹ️</span>
                Listener Instructions
              </h3>
              <div className="text-blue-100 text-sm space-y-1">
                <p>• Click on any <span className="text-blue-300 font-semibold">empty table section</span> to request joining</p>
                <p>• Wait for the group owner to accept your request</p>
                <p>• You can cancel your request by clicking the section again</p>
                {currentUserJoinRequest !== null && (
                  <p className="text-yellow-300 font-semibold">
                    🟡 You have requested Section {currentUserJoinRequest + 1} - waiting for approval
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listeners Section */}
        {groupData.waitingUsers && groupData.waitingUsers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-400 font-semibold mb-4 ml-10 flex items-center gap-2">
              <span className="text-lg">👂</span>
              Listeners ({groupData.waitingUsers.length})
            </h3>
            <div className="max-w-4xl ml-8">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-2">
              {groupData.waitingUsers.map(user => (
                <div key={user.id} className="relative">
                  <div 
                    onClick={() => {
                      if (isOwner) {
                        handleListenerClick(user.id);
                      } else {
                        // Show user info for any user click
                        setSelectedListener(user.id);
                        handleShowUserInfo(user.id);
                      }
                    }}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedListener === user.id ? 'transform scale-105' : ''
                    }`}
                  >
                    <MemberAvatar 
                      name={user.name} 
                      avatarUrl={user.avatarUrl}
                      isPurpleCrownAdmin={purpleCrownAdmins.includes(user.id)}
                      nationality={user.nationality}
                      userId={user.id}
                    />
                    {/* Listening indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                  </div>
                  
                  {/* Request Indicator and Owner Actions */}
                  {user.hasRequested && (
                    <div className="mt-2">
                      {/* Request indicator for everyone */}
                      <div className="bg-yellow-600/80 text-yellow-100 text-xs px-2 py-1 rounded-full text-center">
                        Want to join
                      </div>
                      
                      {/* Owner action buttons */}
                      {isOwner && (
                        <div className="flex gap-1 mt-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptRequest(user.id, user.requestedSeatPosition || 0);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                            title="Accept request"
                          >
                            <FaCheck className="text-xs" />
                            Accept
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectRequest(user.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                            title="Reject request"
                          >
                            <FaTimes className="text-xs" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action buttons for owner - only for non-requesting users */}
                  {isOwner && selectedListener === user.id && !user.hasRequested && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 bg-gray-900 p-2 rounded-lg shadow-lg z-10">
                      <button 
                        onClick={() => handleRequestToJoin(user.id)}
                        className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                        title="Request to join"
                      >
                        <FaMicrophone className="text-xs" />
                        <span className="text-xs">Request</span>
                      </button>
                      <button 
                        onClick={() => handleKickListener(user.id)}
                        className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700 flex items-center gap-1"
                        title="Kick listener"
                      >
                        <FaTimes className="text-xs" />
                        <span className="text-xs">Kick</span>
                      </button>
                      <button 
                        onClick={() => {
                          setMessagingUser({
                            id: user.id,
                            name: user.name,
                            avatar: user.avatarUrl
                          });
                          setShowMessagingPanel(true);
                        }}
                        className="bg-green-600 text-white p-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                        title="Message user"
                      >
                        <FaComment className="text-xs" />
                        <span className="text-xs">Message</span>
                      </button>
                      <button 
                        onClick={() => handleShowUserInfo(user.id)}
                        className="bg-gray-600 text-white p-1 rounded text-xs hover:bg-gray-700 flex items-center gap-1"
                        title="User info"
                      >
                        <FaInfoCircle className="text-xs" />
                        <span className="text-xs">Info</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        )}
      </div>

      {/* User Info Modal */}
      {showUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">User Information</h3>
              <button 
                onClick={() => setShowUserInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            {selectedListener && (
              <div className="text-white">
                {(() => {
                  // Check both waitingUsers and tableSeats for the selected user
                  let user = groupData.waitingUsers.find(u => u.id === selectedListener);
                  let isTableUser = false;
                  
                  if (!user) {
                    // Check table seats for the user
                    const seatWithUser = groupData.tableSeats.find(seat => seat.user && seat.user.id === selectedListener);
                    if (seatWithUser && seatWithUser.user) {
                      user = {
                        ...seatWithUser.user
                      };
                      isTableUser = true;
                    }
                  }
                  
                  // If still not found, check if it's the owner
                  if (!user && groupData.owner.id === selectedListener) {
                    user = {
                      ...groupData.owner,
                      requestedAt: new Date()
                    } as any;
                    (user as any).isOwner = true;
                    isTableUser = true;
                  }
                  
                  console.log('Modal user found:', user, 'isTableUser:', isTableUser);
                  
                  return user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          {user.nationality && (
                            <div className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full p-1 border border-gray-300 shadow-sm">
                              {getFlagEmoji(user.nationality)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{user.name}</h4>
                          <p className="text-gray-400 text-sm">{(user as any).isOwner ? 'Owner' : (isTableUser ? 'Participant' : 'Listener')}</p>
                          {user.nationality && (
                            <p className="text-gray-300 text-xs">{getCountryName(user.nationality)}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {user.nativeLanguage && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Native Language:</span>
                            <span className="text-blue-300">{user.nativeLanguage}</span>
                          </div>
                        )}
                        {user.targetLanguage && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Learning:</span>
                            <span className="text-green-300">{user.targetLanguage}</span>
                          </div>
                        )}
                      </div>
                      
                      {!(user as any).isOwner && (
                        <div className="flex gap-2 pt-4">
                          {isTableUser ? (
                            <>
                              <button 
                                onClick={() => {
                                  // Handle follow functionality for table users
                                  console.log('Following user:', user.id);
                                  setShowUserInfo(false);
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                              >
                                <FaUserPlus className="text-sm" />
                                Follow
                              </button>
                              <button 
                                onClick={() => {
                                  // Open messaging panel with the user
                                  setMessagingUser({
                                    id: user.id,
                                    name: user.name,
                                    avatar: user.avatarUrl
                                  });
                                  setShowMessagingPanel(true);
                                  setShowUserInfo(false);
                                }}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                              >
                                <FaComment className="text-sm" />
                                Message
                              </button>
                            </>
                          ) : (
                            <>
                              {isOwner ? (
                                <>
                                  <button 
                                    onClick={() => {
                                      handleRequestToJoin(user.id);
                                      setShowUserInfo(false);
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                                  >
                                    <FaMicrophone className="text-sm" />
                                    Request to Join
                                  </button>
                                  <button 
                                    onClick={() => {
                                      handleKickListener(user.id);
                                      setShowUserInfo(false);
                                    }}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center justify-center gap-2"
                                  >
                                    <FaTimes className="text-sm" />
                                    Kick
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      // Handle follow functionality for listeners
                                      console.log('Following user:', user.id);
                                      setShowUserInfo(false);
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                                  >
                                    <FaUserPlus className="text-sm" />
                                    Follow
                                  </button>
                                  <button 
                                    onClick={() => {
                                      // Open messaging panel with the user
                                      setMessagingUser({
                                        id: user.id,
                                        name: user.name,
                                        avatar: user.avatarUrl
                                      });
                                      setShowMessagingPanel(true);
                                      setShowUserInfo(false);
                                    }}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                                  >
                                    <FaComment className="text-sm" />
                                    Message
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messaging Panel */}
      {showMessagingPanel && messagingUser && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-600">
          {/* Header */}
          <div className="bg-gray-700 p-4 flex items-center justify-between border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <img 
                src={messagingUser.avatar} 
                alt={messagingUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-white font-semibold">{messagingUser.name}</h3>
                <p className="text-gray-400 text-sm">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMessagingPanel(false)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
              title="Leave message"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-96 overflow-y-auto bg-gray-800">
            <div className="space-y-4">
              {messagingUser && (() => {
                const conversation = getConversation(messagingUser.id);
                return conversation ? conversation.messages.map((message, index) => (
                  <div key={message.id} className={`flex ${message.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${message.sender === 'Me' ? 'bg-blue-600' : 'bg-gray-700'} text-white p-3 rounded-lg max-w-xs`}>
                      <p className="text-sm">{message.text}</p>
                      <span className={`text-xs ${message.sender === 'Me' ? 'text-blue-200' : 'text-gray-400'} mt-1 block`}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 mt-8">
                    <p>Start a conversation with {messagingUser.name}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-600 bg-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 bg-gray-600 text-white p-3 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaComment className="text-sm" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Owner Leave Modal */}
      {showOwnerLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <FaSignOutAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Leave Group</h3>
                  <p className="text-gray-400 text-sm">Choose your exit option</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOwnerLeaveModal(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-full transition-all duration-200"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-300 text-sm leading-relaxed">
                  As the group owner, you can either close the group permanently or transfer ownership and leave.
                </p>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleCloseGroupPermanently}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 hover:shadow-xl group"
                >
                  <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold">Close Group Permanently</div>
                    <div className="text-red-200 text-xs">This action cannot be undone</div>
                  </div>
                </button>
                
                <button 
                  onClick={handleTransferOwnership}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 hover:shadow-xl group"
                >
                  <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-semibold">Transfer & Leave</div>
                    <div className="text-yellow-200 text-xs">Group stays active with new owner</div>
                  </div>
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-600">
                <button 
                  onClick={() => setShowOwnerLeaveModal(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <InviteFriendsModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteFriend={() => {}}
      />

      <EngagementRequestModal 
        isOpen={showEngagementModal}
        onClose={() => setShowEngagementModal(false)}
        onSubmitRequest={() => {}}
        groupName={groupData.name}
      />

      <ImageUploadModal 
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onUpload={handleImageUpload}
        groupName={groupData.name}
      />

      <ImageGalleryModal 
        isOpen={showImageGalleryModal}
        onClose={() => setShowImageGalleryModal(false)}
        images={groupImages}
        onDeleteImage={handleDeleteImage}
        currentUserId={username || 'current-user'}
        isOwner={isOwner}
      />
    </div>
    </VoiceProvider>
  );
};

export default GroupPage;