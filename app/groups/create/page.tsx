"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface CreateGroupForm {
  name: string;
  language: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CreateGroupPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGroupForm>({
    name: '',
    language: '',
    level: 'Beginner'
  });

  const languages = [
    { code: 'en', name: 'English', flag: 'US' },
    { code: 'es', name: 'Spanish', flag: 'ES' },
    { code: 'fr', name: 'French', flag: 'FR' },
    { code: 'de', name: 'German', flag: 'DE' },
    { code: 'it', name: 'Italian', flag: 'IT' },
    { code: 'pt', name: 'Portuguese', flag: 'PT' },
    { code: 'ru', name: 'Russian', flag: 'RU' },
    { code: 'ja', name: 'Japanese', flag: 'JP' },
    { code: 'ko', name: 'Korean', flag: 'KR' },
    { code: 'zh', name: 'Chinese', flag: 'CN' },
    { code: 'ar', name: 'Arabic', flag: 'SA' },
    { code: 'hi', name: 'Hindi', flag: 'IN' }
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      showToast('Please log in to create a group', 'error');
      router.push('/login');
      return;
    }

    if (!formData.name.trim() || !formData.language.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const groupData = {
        name: formData.name.trim(),
        language: formData.language,
        description: `A new ${formData.level.toLowerCase()} level ${formData.language} conversation group.`,
        ownerId: user.id
      };
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }

      showToast('Group created successfully!', 'success');
      
      // Redirect to the specific group conversation page
      router.push(`/groups/${data.group.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateGroupForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Group</h1>
            <p className="text-gray-400 mt-1">Set up your language learning conversation table</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Single Form Box */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Group Information</h2>
            
            <div className="space-y-6">
              {/* Group Name and Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., English Coffee Chat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language *
                  </label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a language</option>
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.name}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Skill Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <div
                      key={level}
                      onClick={() => handleInputChange('level', level as any)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.level === level
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <h3 className="font-semibold text-white mb-2">{level}</h3>
                      <p className="text-sm text-gray-400">
                        {level === 'Beginner' && 'Just starting out, basic phrases and vocabulary'}
                        {level === 'Intermediate' && 'Can have conversations, working on fluency'}
                        {level === 'Advanced' && 'Near-native level, complex discussions'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.language}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;