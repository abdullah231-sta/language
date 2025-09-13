// app/groups/[groupId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaComment, FaGift, FaHeadphones, FaRegSmile, FaSignOutAlt, FaUserPlus, FaTimes, FaCheck, FaUserMinus, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute, FaInfoCircle } from 'react-icons/fa';
import MemberAvatar from '@/components/MemberAvatar';
import { useUser } from '@/context/UserContext';
import { useMessaging } from '@/context/MessagingContext';
import InviteFriendsModal from '@/components/modals/InviteFriendsModal';
import EngagementRequestModal from '@/components/modals/EngagementRequestModal';
import GroupChat from '@/components/GroupChat';
import { getFlagEmoji, getCountryName } from '@/utils/flags';

// Enhanced group data structure with table seating where owner takes center position
const getGroupData = (groupId: string) => {
  return {
    id: 1,
    name: 'English Learners',
    language: 'English Beginner',
    owner: {
      id: 'user-1',
      name: 'GroupOwner', // This will be updated with current user
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop',
      nationality: 'US',
      nativeLanguage: 'English',
      targetLanguage: 'Spanish'
    },
    // Table sections: 10 seats - Owner takes position 0, others follow sequentially
    tableSeats: [
      // Owner in position 0 (section 1)
      { 
        position: 0,
        user: { 
          id: 'user-1', // Owner ID
          name: 'GroupOwner', // Will be updated with current user
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop',
          isMuted: false,
          isOwner: true,
          nationality: 'US',
          nativeLanguage: 'English',
          targetLanguage: 'Spanish'
        }
      },
      // User 2 in position 1 (section 2)
      { 
        position: 1,
        user: { 
          id: 'user-3',
          name: 'Riven', 
          avatarUrl: 'https://images.unsplash.com/photo-1516733232583-3f9b06881a7b?w=500&auto=format&fit=crop',
          isMuted: false,
          nationality: 'FR',
          nativeLanguage: 'French',
          targetLanguage: 'English'
        }
      },
      // User 3 in position 2 (section 3)
      { 
        position: 2,
        user: { 
          id: 'user-4',
          name: 'Sarah', 
          avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
          isMuted: false,
          nationality: 'DE',
          nativeLanguage: 'German',
          targetLanguage: 'English'
        }
      },
      // Empty seats
      { position: 3, user: null },
      { position: 4, user: null },
      { position: 5, user: null },
      { position: 6, user: null },
      { position: 7, user: null },
      { position: 8, user: null },
      { position: 9, user: null }
    ],
    // Users waiting to be accepted into table sections
    waitingUsers: [
      {
        id: 'user-6',
        name: 'Emma',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616c64c4caf?w=500&auto=format&fit=crop',
        requestedAt: new Date('2025-09-12T11:10:00'),
        nationality: 'JP',
        nativeLanguage: 'Japanese',
        targetLanguage: 'English'
      },
      {
        id: 'user-7', 
        name: 'James',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
        requestedAt: new Date('2025-09-12T11:12:00'),
        nationality: 'KR',
        nativeLanguage: 'Korean',
        targetLanguage: 'English'
      },
      {
        id: 'user-8',
        name: 'Lisa', 
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop',
        requestedAt: new Date('2025-09-12T11:15:00'),
        nationality: 'CN',
        nativeLanguage: 'Chinese',
        targetLanguage: 'English'
      }
    ],
    engagementRequests: [
      {
        id: 'user-5',
        name: 'Alex',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
        requestedAt: new Date('2025-09-12T11:15:00'),
        message: 'Can I join the conversation?'
      }
    ]
  };
}

const GroupPage = ({ params }: { params: { groupId: string } }) => {
  const { groupId } = params;
  const groupData = getGroupData(groupId);
  const { username, avatar, nationality, nativeLanguage, targetLanguage } = useUser();
  const { conversations, addMessage, getConversation } = useMessaging();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
  const [joinRequests, setJoinRequests] = useState<{[sectionNumber: number]: {userId: string, userName: string, userAvatar: string, timestamp: Date}}>({});
  const [currentUserJoinRequest, setCurrentUserJoinRequest] = useState<number | null>(null);
  const [showOwnerLeaveModal, setShowOwnerLeaveModal] = useState(false);
  const [purpleCrownAdmins, setPurpleCrownAdmins] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  
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
  
  // Update the owner name and avatar to match current user when they're the owner
  const updatedGroupData = {
    ...groupData,
    owner: {
      ...groupData.owner,
      name: username, // Use current user as owner
      avatarUrl: avatar || groupData.owner.avatarUrl, // Use current user's avatar
      nationality: nationality,
      nativeLanguage: nativeLanguage,
      targetLanguage: targetLanguage
    },
    tableSeats: groupData.tableSeats.map(seat => {
      // Only update the owner seat with current user data if they're NOT joining as listener
      if (seat.user && seat.user.isOwner && !isJoiningAsListener) {
        return {
          ...seat,
          user: {
            ...seat.user,
            name: username,
            avatarUrl: avatar || seat.user.avatarUrl,
            nationality: nationality,
            nativeLanguage: nativeLanguage,
            targetLanguage: targetLanguage
          }
        };
      }
      return seat;
    }),
    // Add current user to waiting list if joining as listener
    waitingUsers: isJoiningAsListener && !groupData.waitingUsers.some(user => user.name === username) 
      ? [
          {
            id: `user-${username}`,
            name: username,
            avatarUrl: avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop',
            requestedAt: new Date(),
            nationality: nationality,
            nativeLanguage: nativeLanguage,
            targetLanguage: targetLanguage
          },
          ...groupData.waitingUsers
        ]
      : groupData.waitingUsers
  };
  
  const isOwner = username === updatedGroupData.owner.name && !isJoiningAsListener;

  const handleMuteUser = (position: number, userId: string) => {
    setSeatMuteStates(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
    console.log('Toggling mute for user:', userId, 'at position:', position);
    setSelectedSeat(null);
  };

  const handleKickUser = (position: number, userId: string) => {
    // Remove user from seat
    console.log('Kicking user:', userId, 'from position:', position);
    setSelectedSeat(null);
  };

  const handleAcceptUser = (userId: string) => {
    // Find first empty seat and assign user to it
    const emptySeatIndex = updatedGroupData.tableSeats.findIndex(seat => seat.user === null);
    if (emptySeatIndex !== -1) {
      console.log('Accepting user:', userId, 'to position:', emptySeatIndex);
      // In a real app, this would update the backend
    }
    setSelectedListener(null);
  };

  const handleRejectUser = (userId: string) => {
    console.log('Rejecting user:', userId);
    // In a real app, this would update the backend
    setSelectedListener(null);
  };

  const handleRequestToJoin = (userId: string) => {
    console.log('Requesting user to join:', userId);
    // In a real app, this would send a join request
    setSelectedListener(null);
  };

  const handleKickListener = (userId: string) => {
    console.log('Kicking listener:', userId);
    // In a real app, this would remove the listener
    setSelectedListener(null);
  };

  const handleShowUserInfo = (userId: string) => {
    console.log('Showing info for user:', userId);
    setSelectedListener(userId);
    setShowUserInfo(true);
  };

  const handleMakePurpleCrownAdmin = (userId: string, userName: string) => {
    setPurpleCrownAdmins(prev => [...prev, userId]);
    console.log(`${userName} has been made a purple crown admin`);
    alert(`${userName} has been granted admin privileges (purple crown)!`);
    setSelectedSeat(null);
  };

  const handleRemovePurpleCrownAdmin = (userId: string, userName: string) => {
    setPurpleCrownAdmins(prev => prev.filter(id => id !== userId));
    console.log(`${userName} admin privileges removed`);
    alert(`${userName}'s admin privileges have been removed.`);
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

  const handleSeatClick = (position: number) => {
    const seat = updatedGroupData.tableSeats[position];
    if (isOwner && seat.user && !seat.user.isOwner) {
      setSelectedSeat(selectedSeat === position ? null : position);
    } else if (isJoiningAsListener && !seat.user && !currentUserJoinRequest) {
      // Listener requesting to join empty seat
      handleRequestToJoinSeat(position);
    }
  };

  const handleRequestToJoinSeat = (sectionNumber: number) => {
    const newRequest = {
      userId: `user-${username}`,
      userName: username,
      userAvatar: avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop',
      timestamp: new Date()
    };
    
    setJoinRequests(prev => ({
      ...prev,
      [sectionNumber]: newRequest
    }));
    
    setCurrentUserJoinRequest(sectionNumber);
  };

  const handleAcceptJoinRequest = (sectionNumber: number) => {
    const request = joinRequests[sectionNumber];
    if (request) {
      // Remove from join requests
      setJoinRequests(prev => {
        const updated = { ...prev };
        delete updated[sectionNumber];
        return updated;
      });
      
      // In a real app, this would update the backend to move user to table
      console.log(`Accepting ${request.userName} to section ${sectionNumber + 1}`);
      alert(`${request.userName} has been accepted to Section ${sectionNumber + 1}!`);
    }
  };

  const handleRejectJoinRequest = (sectionNumber: number) => {
    const request = joinRequests[sectionNumber];
    if (request) {
      // Remove from join requests
      setJoinRequests(prev => {
        const updated = { ...prev };
        delete updated[sectionNumber];
        return updated;
      });
      
      // Reset current user request if it was rejected
      if (request.userId === `user-${username}`) {
        setCurrentUserJoinRequest(null);
      }
      
      console.log(`Rejecting ${request.userName} from section ${sectionNumber + 1}`);
    }
  };

  if (!updatedGroupData) {
    return <div>Group not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white font-sans relative">
      {/* Group Chat Panel */}
      {showChat && (
        <div className="fixed left-0 top-0 bottom-0 z-40 w-80 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-gray-600">
          <GroupChat 
            groupId={groupId} 
            groupName={updatedGroupData.name}
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
      
      <div className="p-4 shadow-md bg-gray-800 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isOwner && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                title="Invite Friends"
              >
                <FaUserPlus className="text-xl" />
              </button>
            )}
            <button 
              onClick={() => setShowChat(!showChat)}
              className="flex items-center text-green-400 hover:text-green-300 transition-colors"
              title="Toggle Chat"
            >
              <FaComment className="text-xl" />
            </button>
            <button 
              onClick={() => {
                if (isOwner) {
                  setShowOwnerLeaveModal(true);
                } else {
                  // Regular user leave - go to home
                  router.push('/');
                }
              }}
              className="flex items-center text-red-400 hover:text-red-300 transition-colors"
              title={isOwner ? "Leave/Close Group" : "Leave Group"}
            >
              <FaSignOutAlt className="text-xl" />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">{updatedGroupData.name}</h1>
            <span className="text-sm bg-gray-700 px-3 py-1 rounded-full mt-1 inline-block">{updatedGroupData.language}</span>
          </div>
          <div className="w-8"></div>
        </div>
      </div>

      <div className={`flex-grow p-6 overflow-y-auto transition-all duration-300 ${showChat ? 'ml-80' : ''} ${showMessagingPanel ? 'mr-80' : ''}`}>
        {/* User Sections - 10 sections arranged in grid */}
        <div className="mb-8">
          {/* User grid */}
          <div className="max-w-4xl ml-8">
            <div className="grid grid-cols-5 gap-4">
              {updatedGroupData.tableSeats.map((seat) => (
                <div key={seat.position} className="relative flex flex-col items-center">
                  {seat.user ? (
                    <div 
                      onClick={() => {
                        console.log('Clicked user:', seat.user.name, 'ID:', seat.user.id);
                        
                        if (isOwner && !seat.user.isOwner) {
                          // For owners: only show management options, don't show user info popup
                          setSelectedSeat(selectedSeat === seat.position ? null : seat.position);
                        } else if (!isOwner) {
                          // For non-owners: show user info directly
                          setSelectedListener(seat.user.id);
                          setShowUserInfo(true);
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
                        isJoiningAsListener && !currentUserJoinRequest 
                          ? 'border-blue-400 hover:border-blue-300 cursor-pointer hover:bg-blue-50' 
                          : 'border-gray-600'
                      } ${
                        joinRequests[seat.position] ? 'border-yellow-400 bg-yellow-50' : ''
                      }`}
                    >
                      {joinRequests[seat.position] ? (
                        <div className="text-center">
                          <span className="text-xs text-yellow-600">Request</span>
                        </div>
                      ) : (
                        <span className="text-xs">
                          {isJoiningAsListener && !currentUserJoinRequest ? 'Click to Join' : 'Empty'}
                        </span>
                      )}
                      
                      {/* Join request indicator */}
                      {joinRequests[seat.position] && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                      )}
                    </div>
                  )}
                  
                  {/* Action buttons for join requests */}
                  {isOwner && joinRequests[seat.position] && selectedSeat === seat.position && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 bg-gray-900 p-1 rounded-lg shadow-lg z-10">
                      <button 
                        onClick={() => handleAcceptJoinRequest(seat.position)}
                        className="bg-green-600 text-white p-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                        title="Accept join request"
                      >
                        <FaCheck className="text-xs" />
                        <span className="text-xs">Accept</span>
                      </button>
                      <button 
                        onClick={() => handleRejectJoinRequest(seat.position)}
                        className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700 flex items-center gap-1"
                        title="Reject join request"
                      >
                        <FaTimes className="text-xs" />
                        <span className="text-xs">Reject</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Action buttons for owner - only show if no join request */}
                  {isOwner && seat.user && !seat.user.isOwner && selectedSeat === seat.position && !joinRequests[seat.position] && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 bg-gray-900 p-1 rounded-lg shadow-lg z-10">
                      <button 
                        onClick={() => handleMuteUser(seat.position, seat.user.id)}
                        className={`${(seat.user.isMuted || seatMuteStates[seat.position]) ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} text-white p-1 rounded text-xs flex items-center gap-1`}
                        title={(seat.user.isMuted || seatMuteStates[seat.position]) ? 'Unmute' : 'Mute'}
                      >
                        {(seat.user.isMuted || seatMuteStates[seat.position]) ? <FaVolumeUp className="text-xs" /> : <FaVolumeMute className="text-xs" />}
                      </button>
                      <button 
                        onClick={() => handleKickUser(seat.position, seat.user.id)}
                        className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700 flex items-center gap-1"
                        title="Kick member"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                      <button 
                        onClick={() => {
                          setMessagingUser({
                            id: seat.user.id,
                            name: seat.user.name,
                            avatar: seat.user.avatarUrl
                          });
                          setShowMessagingPanel(true);
                          setSelectedSeat(null);
                        }}
                        className="bg-green-600 text-white p-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
                        title="Message user"
                      >
                        <FaComment className="text-xs" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedListener(seat.user.id);
                          handleShowUserInfo(seat.user.id);
                        }}
                        className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                        title="User info"
                      >
                        <FaInfoCircle className="text-xs" />
                      </button>
                      {purpleCrownAdmins.includes(seat.user.id) ? (
                        <button 
                          onClick={() => handleRemovePurpleCrownAdmin(seat.user.id, seat.user.name)}
                          className="bg-purple-600 text-white p-1 rounded text-xs hover:bg-purple-700 flex items-center gap-1"
                          title="Remove admin privileges"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleMakePurpleCrownAdmin(seat.user.id, seat.user.name)}
                          className="bg-purple-600 text-white p-1 rounded text-xs hover:bg-purple-700 flex items-center gap-1"
                          title="Grant admin privileges"
                        >
                          <FaGift className="text-xs" />
                        </button>
                      )}
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

        {/* Listeners Section */}
        {updatedGroupData.waitingUsers && updatedGroupData.waitingUsers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-400 font-semibold mb-4 ml-10">
              Listeners ({updatedGroupData.waitingUsers.length})
            </h3>
            <div className="max-w-4xl ml-8">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-2">
              {updatedGroupData.waitingUsers.map(user => (
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
                    />
                    {/* Listening indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                    
                    {/* Join request indicator for this user */}
                    {currentUserJoinRequest !== null && user.name === username && (
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <span className="text-xs text-white">?</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons for owner */}
                  {isOwner && selectedListener === user.id && (
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
                  let user = updatedGroupData.waitingUsers.find(u => u.id === selectedListener);
                  let isTableUser = false;
                  
                  if (!user) {
                    // Check table seats for the user
                    const seatWithUser = updatedGroupData.tableSeats.find(seat => seat.user && seat.user.id === selectedListener);
                    if (seatWithUser && seatWithUser.user) {
                      user = {
                        ...seatWithUser.user,
                        requestedAt: new Date() // Add dummy requestedAt for consistency
                      };
                      isTableUser = true;
                    }
                  }
                  
                  // If still not found, check if it's the owner
                  if (!user && updatedGroupData.owner.id === selectedListener) {
                    user = {
                      ...updatedGroupData.owner,
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
                        {!isTableUser && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Joined:</span>
                            <span>{user.requestedAt.toLocaleTimeString()}</span>
                          </div>
                        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Leave Group Options</h3>
              <button 
                onClick={() => setShowOwnerLeaveModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="text-white space-y-4">
              <p className="text-gray-300">What would you like to do with the group?</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    // Close the entire group
                    alert('Group has been closed and all members have been removed.');
                    router.push('/');
                  }}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <FaTimes className="text-sm" />
                  Close Group Permanently
                </button>
                
                <button 
                  onClick={() => {
                    // Just leave, keep group open
                    alert('You have left the group. The group remains open with current admins managing it.');
                    router.push('/');
                  }}
                  className="w-full bg-yellow-600 text-white py-3 px-4 rounded hover:bg-yellow-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <FaSignOutAlt className="text-sm" />
                  Leave Group (Keep Open)
                </button>
              </div>
              
              <div className="pt-3 border-t border-gray-600">
                <button 
                  onClick={() => setShowOwnerLeaveModal(false)}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
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
        groupName={updatedGroupData.name}
      />
    </div>
  );
};

export default GroupPage;