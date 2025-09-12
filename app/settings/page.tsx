// app/settings/page.tsx

"use client";

import { useRef, ChangeEvent, useState } from 'react';
import { useUser } from '@/context/UserContext';
import PasswordModal from '@/components/modals/PasswordModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { 
  FaUserCircle, 
  FaLanguage, 
  FaPalette, 
  FaSignOutAlt, 
  FaEnvelope, 
  FaLock, 
  FaSave,
  FaExclamationTriangle
} from 'react-icons/fa';

const SettingsPage = () => {
  // Get data and functions from the context
  const { username, avatar, setUsername, setAvatar } = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
        <div className="space-y-12">

          {/* === 1. PROFILE SETTINGS === */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><FaUserCircle className="mr-3 text-blue-500" /> Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center md:items-start">
                <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg" />
                {avatar ? (
                  <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover mb-2" />
                ) : (
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-4xl mb-2">{username.charAt(0).toUpperCase()}</div>
                )}
                <button onClick={handleUploadClick} className="text-sm text-blue-600 hover:underline">Upload Image</button>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium">Username</label>
                  <input type="text" className="w-full p-2 border rounded mt-1 text-gray-900" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Bio</label>
                  <textarea className="w-full p-2 border rounded mt-1 h-24 text-gray-900" placeholder="Tell us about yourself..."></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* === 2. LANGUAGE & TRANSLATION (RESTORED) === */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><FaLanguage className="mr-3 text-green-500" /> Language & Translation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">My Native Language</label>
                <select className="w-full p-2 border rounded mt-1 text-gray-900">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Automatic Translation</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* === 3. ACCOUNT & PREFERENCES (RESTORED) === */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center"><FaPalette className="mr-3 text-purple-500" /> Account & Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium flex items-center"><FaEnvelope className="mr-2 text-gray-400" /> Email Address</span>
                  <p className="text-gray-600">user-email@example.com</p>
                </div>
                <button className="text-sm text-blue-600 hover:underline">Change</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium flex items-center"><FaLock className="mr-2 text-gray-400" /> Password</span>
                  <p className="text-gray-600">********</p>
                </div>
                <button onClick={() => setPasswordModalOpen(true)} className="text-sm text-blue-600 hover:underline">Change</button>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Display Language</label>
                <select className="w-full p-2 border rounded mt-1 text-gray-900">
                  <option>English</option>
                  <option>Arabic (العربية)</option>
                </select>
              </div>
            </div>
          </div>

          {/* === 4. DANGER ZONE (RESTORED) === */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-red-700"><FaExclamationTriangle className="mr-3" /> Danger Zone</h2>
            <p className="text-red-600 mb-4">These actions are permanent and cannot be undone.</p>
            <button onClick={() => setDeleteModalOpen(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
              Delete My Account
            </button>
          </div>
          
          {/* === 5. ACTION BUTTONS (RESTORED) === */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t mt-8">
            <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center">
              <FaSave className="mr-2" /> Save Changes
            </button>
            <button className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition flex items-center justify-center">
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Render the Modals */}
      <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  );
};

export default SettingsPage;