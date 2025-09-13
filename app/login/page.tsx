"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MobileInput, MobileButton } from '@/components/MobileOptimized';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌍</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to continue your language learning journey
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <MobileInput
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({...formData, email: value})}
              className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <MobileInput
              type="password"
              value={formData.password}
              onChange={(value) => setFormData({...formData, password: value})}
              className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
              <span className="text-lg">❌</span>
              <span>{error}</span>
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 min-h-[48px] text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-300 mb-3 font-medium">Demo Accounts:</p>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="p-2 bg-gray-800/50 rounded">
              <p><strong>Account 1:</strong> demo@example.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
            <div className="p-2 bg-gray-800/50 rounded">
              <p><strong>Account 2:</strong> learner@example.com</p>
              <p><strong>Password:</strong> learner123</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Or register a new account below
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Create one here
            </Link>
          </p>
          
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}