"use client";

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useIsMobile, useIsTouchDevice, useSafeArea } from '@/components/MobileOptimized';

interface User {
  id: string;
  username: string;
  email: string;
  nationality: string;
  nativeLanguage: string;
  targetLanguage: string;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  language: string;
  description?: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  groupId?: string;
  conversationId?: string;
  createdAt: string;
  users: {
    username: string;
    email: string;
  };
}

export default function TestPage() {
  const { addNotification } = useNotifications();
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();
  const safeArea = useSafeArea();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [groupData, setGroupData] = useState({
    name: '',
    language: '',
    description: ''
  });
  const [messageData, setMessageData] = useState({
    content: ''
  });

  useEffect(() => {
    testDatabase();
    loadGroups();
  }, []);

  const testDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setTestResult(`✅ Database connected! Found ${data.count} users.`);
      } else {
        setError(`❌ Database error: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ API error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.groups);
      } else {
        console.error('Failed to load groups:', data.error);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const createTestUser = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          full_name: `Test User ${timestamp}`,
          password: 'testpassword123'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Test user created! Username: ${data.user.username}, Email: ${data.user.email}`);
        testDatabase(); // Refresh the list
      } else {
        setError(`❌ Failed to create user: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Error creating user: ${err}`);
    }
  };

  const testLogin = async () => {
    try {
      if (!loginData.emailOrUsername || !loginData.password) {
        setError('❌ Please enter email/username and password');
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        setTestResult(`✅ Login successful! Welcome ${data.user.username}!`);
        setError('');
      } else {
        setError(`❌ Login failed: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Login error: ${err}`);
    }
  };

  const createGroup = async () => {
    try {
      if (!currentUser) {
        setError('❌ Please login first to create a group');
        return;
      }

      if (!groupData.name || !groupData.language) {
        setError('❌ Please enter group name and language');
        return;
      }

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...groupData,
          ownerId: currentUser.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Group "${data.group.name}" created successfully!`);
        setGroupData({ name: '', language: '', description: '' });
        loadGroups(); // Refresh groups list
        setError('');
      } else {
        setError(`❌ Failed to create group: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Error creating group: ${err}`);
    }
  };

  const loadMessages = async (groupId: string) => {
    try {
      const response = await fetch(`/api/messages?groupId=${groupId}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error('Failed to load messages:', data.error);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const sendMessage = async () => {
    try {
      if (!currentUser || !selectedGroup) {
        setError('❌ Please login and select a group first');
        return;
      }

      if (!messageData.content.trim()) {
        setError('❌ Please enter a message');
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageData.content,
          senderId: currentUser.id,
          groupId: selectedGroup.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Message sent to ${selectedGroup.name}!`);
        setMessageData({ content: '' });
        loadMessages(selectedGroup.id); // Refresh messages
        setError('');
      } else {
        setError(`❌ Failed to send message: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Error sending message: ${err}`);
    }
  };

  const selectGroup = async (group: Group) => {
    setSelectedGroup(group);
    await loadMessages(group.id);
  };

  const joinGroup = async (groupId: string) => {
    try {
      if (!currentUser) {
        setError('❌ Please login first to join a group');
        return;
      }

      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          groupId: groupId,
          action: 'join'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ ${data.message}`);
        setError('');
      } else {
        setError(`❌ Failed to join group: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Error joining group: ${err}`);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white safe-area-all">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Language Learning App - Backend Test</h1>
        
        {/* Mobile Status Info */}
        <div className="bg-blue-900/20 border border-blue-500 p-4 rounded mb-4">
          <h3 className="font-semibold mb-2">Device Information</h3>
          <div className="text-sm space-y-1">
            <div>📱 Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>👆 Touch Device: {isTouchDevice ? 'Yes' : 'No'}</div>
            <div>🔒 Safe Area: Top: {safeArea.top}, Bottom: {safeArea.bottom}, Left: {safeArea.left}, Right: {safeArea.right}</div>
            <div>📐 Screen: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'}</div>
          </div>
        </div>
        
        {loading && (
          <div className="text-blue-400">Testing database connection...</div>
        )}
        
        {testResult && (
          <div className="bg-green-900/20 border border-green-500 p-4 rounded mb-4">
            {testResult}
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/20 border border-red-500 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {currentUser && (
          <div className="bg-blue-900/20 border border-blue-500 p-4 rounded mb-4">
            ✅ Logged in as: <strong>{currentUser.username}</strong> ({currentUser.email})
          </div>
        )}

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6`}>
          {/* Notification Tests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notification Tests</h2>
            <button
              onClick={() => addNotification({
                type: 'success',
                title: 'Welcome!',
                message: 'You have successfully joined the app'
              })}
              className={`bg-green-600 hover:bg-green-700 px-4 py-2 rounded w-full ${isTouchDevice ? 'min-h-[48px]' : ''}`}
            >
              Success Notification
            </button>
            
            <button
              onClick={() => addNotification({
                type: 'message',
                title: 'New Message',
                message: 'John sent you a message',
                actionUrl: '/messages'
              })}
              className={`bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full ${isTouchDevice ? 'min-h-[48px]' : ''}`}
            >
              Message Notification
            </button>
            
            <button
              onClick={() => addNotification({
                type: 'group',
                title: 'Group Activity',
                message: 'Spanish Learners group has new activity',
                actionUrl: '/groups/1'
              })}
              className={`bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded w-full ${isTouchDevice ? 'min-h-[48px]' : ''}`}
            >
              Group Notification
            </button>
            
            <button
              onClick={() => addNotification({
                type: 'warning',
                title: 'System Warning',
                message: 'Server maintenance in 30 minutes'
              })}
              className={`bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded w-full ${isTouchDevice ? 'min-h-[48px]' : ''}`}
            >
              Warning Notification
            </button>
            
            <button
              onClick={() => addNotification({
                type: 'error',
                title: 'Connection Error',
                message: 'Failed to connect to server'
              })}
              className={`bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full ${isTouchDevice ? 'min-h-[48px]' : ''}`}
            >
              Error Notification
            </button>
            
            {/* Mobile-specific test */}
            <button
              onClick={() => addNotification({
                type: 'success',
                title: 'Mobile Test',
                message: `Device: ${isMobile ? 'Mobile' : 'Desktop'} | Touch: ${isTouchDevice ? 'Yes' : 'No'}`
              })}
              className={`bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded w-full ${isTouchDevice ? 'min-h-[48px]' : ''}`}
            >
              📱 Mobile Detection Test
            </button>
          </div>

          {/* Database Tests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Database Tests</h2>
            <button
              onClick={testDatabase}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full"
            >
              Test Database Connection
            </button>
            
            <button
              onClick={createTestUser}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded w-full"
            >
              Create Test User
            </button>
          </div>

          {/* Authentication Tests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Authentication</h2>
            
            <input
              type="text"
              placeholder="Email or Username"
              value={loginData.emailOrUsername}
              onChange={(e) => setLoginData({...loginData, emailOrUsername: e.target.value})}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
            
            <button
              onClick={testLogin}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded w-full"
            >
              Test Login
            </button>
            
            <div className="text-sm text-gray-400">
              💡 Password: testpassword123<br/>
              📝 Note: Only use newly created test users for login testing
            </div>
          </div>

          {/* Groups Management */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Groups Management</h2>
            
            <input
              type="text"
              placeholder="Group Name"
              value={groupData.name}
              onChange={(e) => setGroupData({...groupData, name: e.target.value})}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
            
            <input
              type="text"
              placeholder="Language (e.g., Spanish, French)"
              value={groupData.language}
              onChange={(e) => setGroupData({...groupData, language: e.target.value})}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
            
            <textarea
              placeholder="Description (optional)"
              value={groupData.description}
              onChange={(e) => setGroupData({...groupData, description: e.target.value})}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
              rows={3}
            />
            
            <button
              onClick={createGroup}
              disabled={!currentUser}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-4 py-2 rounded w-full"
            >
              Create Group
            </button>
            
            <div className="text-sm text-gray-400">
              🔒 Login required to create groups
            </div>
          </div>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8 mt-8`}>
          {/* Groups List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Groups ({groups.length})</h2>
            
            {groups.length === 0 ? (
              <p className="text-gray-400">No groups found. Try creating a group.</p>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {groups.map((group: Group) => (
                  <div key={group.id} className={`bg-gray-800 p-3 rounded border ${selectedGroup?.id === group.id ? 'border-blue-500' : ''}`}>
                    <div className="font-semibold">{group.name}</div>
                    <div className="text-blue-400 text-sm">🌍 {group.language}</div>
                    {group.description && (
                      <div className="text-gray-300 text-sm mt-1">{group.description}</div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectGroup(group)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          {selectedGroup?.id === group.id ? 'Selected' : 'View Chat'}
                        </button>
                        <button
                          onClick={() => joinGroup(group.id)}
                          disabled={!currentUser}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Users List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
            
            {users.length === 0 ? (
              <p className="text-gray-400">No users found. Try creating a test user.</p>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {users.map((user: User) => (
                  <div key={user.id} className="bg-gray-800 p-3 rounded border">
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      {user.nativeLanguage} → {user.targetLanguage}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messaging Interface */}
        {selectedGroup && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              💬 {selectedGroup.name} Chat
            </h2>
            
            {/* Messages Display */}
            <div className="bg-gray-900 rounded p-4 h-64 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center">No messages yet. Be the first to say hello! 👋</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((message: Message) => (
                    <div key={message.id} className="bg-gray-700 rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-blue-400">
                          {message.users.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-200">{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={currentUser ? "Type your message..." : "Login to send messages"}
                value={messageData.content}
                onChange={(e) => setMessageData({ content: e.target.value })}
                disabled={!currentUser}
                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 disabled:bg-gray-800"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!currentUser || !messageData.content.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
            
            {!currentUser && (
              <div className="text-sm text-gray-400 mt-2">
                🔒 Please login to participate in the chat
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}