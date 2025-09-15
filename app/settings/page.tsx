// app/settings/page.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PasswordModal from '@/components/modals/PasswordModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { 
  FaPalette, 
  FaSignOutAlt, 
  FaEnvelope, 
  FaLock, 
  FaSave,
  FaExclamationTriangle,
  FaEdit,
  FaTimes,
  FaGlobe
} from 'react-icons/fa';

const SettingsPage = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayLanguage: user?.displayLanguage || 'English',
    automaticTranslation: user?.automaticTranslation ?? true
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState('');
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setFormData({
      displayLanguage: user?.displayLanguage || 'English',
      automaticTranslation: user?.automaticTranslation ?? true
    });
    setErrors({});
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setSuccess('');
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const updates = {
      displayLanguage: formData.displayLanguage,
      automaticTranslation: formData.automaticTranslation
    };

    const result = await updateProfile(updates);

    if (result.success) {
      setSuccess('Settings updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setErrors({ general: result.error || 'Failed to update settings' });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      showSuccess('Logging out...');
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Add actual logout logic here
      showSuccess('Logged out successfully!');
    } catch {
      showError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view settings</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and application settings</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Settings Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {/* Settings Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Application Settings
                  </h2>
                  <p className="text-blue-100 mt-2">Configure your language learning experience</p>
                </div>
                <div className="flex-shrink-0">
                  {!isEditing ? (
                    <button
                      onClick={handleEditStart}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit Settings</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                      >
                        <FaSave />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <FaTimes />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="p-6 sm:p-8">
              {!isEditing ? (
                // View Mode
                <div className="space-y-8">
                  {/* Application Preferences */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <FaPalette />
                      <span>Application Preferences</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Display Language</label>
                        <div className="text-white font-medium">{user.displayLanguage || 'English'}</div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Automatic Translation</label>
                        <div className="text-white font-medium">
                          {user.automaticTranslation ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <FaGlobe />
                      <span>Account Actions</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <div>
                          <span className="font-medium text-white flex items-center">
                            <FaEnvelope className="mr-2 text-gray-400" /> Email Address
                          </span>
                          <p className="text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                          <span className="font-medium text-white flex items-center">
                            <FaLock className="mr-2 text-gray-400" /> Password
                          </span>
                          <p className="text-gray-400">********</p>
                        </div>
                        <button onClick={() => setPasswordModalOpen(true)} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          Change
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center space-x-2">
                      <FaExclamationTriangle />
                      <span>Danger Zone</span>
                    </h3>
                    <p className="text-red-300 mb-4">These actions are permanent and cannot be undone.</p>
                    <button 
                      onClick={() => setDeleteModalOpen(true)} 
                      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50"
                    >
                      <FaExclamationTriangle className="mr-2" />
                      <span>Delete My Account</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="flex justify-center pt-6 border-t border-gray-700">
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          <span>Logging out...</span>
                        </>
                      ) : (
                        <>
                          <FaSignOutAlt className="mr-2" /> 
                          <span>Logout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  {/* General Error */}
                  {errors.general && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
                      <span className="text-lg">❌</span>
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Application Preferences Edit */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Application Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Display Language</label>
                        <select
                          name="displayLanguage"
                          value={formData.displayLanguage}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="English" className="bg-gray-700">English</option>
                          <option value="Arabic" className="bg-gray-700">Arabic (العربية)</option>
                          <option value="Spanish" className="bg-gray-700">Spanish (Español)</option>
                          <option value="French" className="bg-gray-700">French (Français)</option>
                          <option value="German" className="bg-gray-700">German (Deutsch)</option>
                          <option value="Chinese" className="bg-gray-700">Chinese (中文)</option>
                          <option value="Japanese" className="bg-gray-700">Japanese (日本語)</option>
                          <option value="Korean" className="bg-gray-700">Korean (한국어)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                          <span className="font-medium text-white">Automatic Translation</span>
                          <p className="text-gray-400 text-sm">Automatically translate messages in conversations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="automaticTranslation"
                            checked={formData.automaticTranslation}
                            onChange={handleChange}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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