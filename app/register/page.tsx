"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    nationality: '',
    nativeLanguage: '',
    targetLanguages: [''],
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  const countries = [
    'US', 'ES', 'FR', 'DE', 'IT', 'PT', 'CN', 'JP', 'KR', 'SA', 'RU', 'IN', 'GB', 'CA', 'AU'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTargetLanguageChange = (index: number, value: string) => {
    const newTargetLanguages = [...formData.targetLanguages];
    newTargetLanguages[index] = value;
    setFormData({
      ...formData,
      targetLanguages: newTargetLanguages
    });
  };

  const addTargetLanguage = () => {
    if (formData.targetLanguages.length < 3) {
      setFormData({
        ...formData,
        targetLanguages: [...formData.targetLanguages, '']
      });
    }
  };

  const removeTargetLanguage = (index: number) => {
    if (formData.targetLanguages.length > 1) {
      const newTargetLanguages = formData.targetLanguages.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        targetLanguages: newTargetLanguages
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Language validation
    if (!formData.nativeLanguage) {
      newErrors.nativeLanguage = 'Please select your native language';
    }

    if (!formData.targetLanguages[0]) {
      newErrors.targetLanguages = 'Please select at least one target language';
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Please select your nationality';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSuccess('');
    setErrors({});

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationality: formData.nationality,
      nativeLanguage: formData.nativeLanguage,
      targetLanguages: formData.targetLanguages.filter(lang => lang !== ''),
      level: formData.level
    };

    const result = await register(userData);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setErrors({ general: result.error || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join Our Community
          </h1>
          <p className="text-gray-400">
            Start your language learning adventure today
          </p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
              placeholder="Choose a unique username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-400">{errors.username}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
              placeholder="Your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
              placeholder="Your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nationality
            </label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.nationality ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
            >
              <option value="">Select your country</option>
              {countries.map(country => (
                <option key={country} value={country} className="bg-gray-700">{country}</option>
              ))}
            </select>
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-400">{errors.nationality}</p>
            )}
          </div>

          {/* Native Language */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Native Language
            </label>
            <select
              name="nativeLanguage"
              value={formData.nativeLanguage}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.nativeLanguage ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
            >
              <option value="">Select your native language</option>
              {languages.map(language => (
                <option key={language} value={language} className="bg-gray-700">{language}</option>
              ))}
            </select>
            {errors.nativeLanguage && (
              <p className="mt-1 text-sm text-red-400">{errors.nativeLanguage}</p>
            )}
          </div>

          {/* Target Languages */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Languages to Learn
            </label>
            {formData.targetLanguages.map((targetLang, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={targetLang}
                  onChange={(e) => handleTargetLanguageChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a language</option>
                  {languages.filter(lang => lang !== formData.nativeLanguage && !formData.targetLanguages.includes(lang) || lang === targetLang).map(language => (
                    <option key={language} value={language} className="bg-gray-700">{language}</option>
                  ))}
                </select>
                {formData.targetLanguages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTargetLanguage(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            {formData.targetLanguages.length < 3 && (
              <button
                type="button"
                onClick={addTargetLanguage}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                + Add another language
              </button>
            )}
            {errors.targetLanguages && (
              <p className="mt-1 text-sm text-red-400">{errors.targetLanguages}</p>
            )}
          </div>

          {/* Learning Level */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Learning Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base min-h-[48px]"
            >
              <option value="Beginner" className="bg-gray-700">Beginner</option>
              <option value="Intermediate" className="bg-gray-700">Intermediate</option>
              <option value="Advanced" className="bg-gray-700">Advanced</option>
            </select>
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
              placeholder="Create a secure password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-4 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-base min-h-[48px] ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
              <span className="text-lg">❌</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 min-h-[48px] text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
          
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}