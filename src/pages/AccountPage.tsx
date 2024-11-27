import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { updateProfile, updatePassword } from '../lib/supabase';
import { User, Lock } from 'lucide-react';

export const AccountPage = () => {
  const { user, profile, updateProfile: updateStoreProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateProfile(user.id, { username: formData.username });
      await updateStoreProfile({ username: formData.username });
      setMessage('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await updatePassword(formData.newPassword);
      setMessage('Password updated successfully');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error('Password update error:', error);
      setMessage(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {message && (
          <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-800' : 'bg-red-800'} text-white`}>
            {message}
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={e => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};