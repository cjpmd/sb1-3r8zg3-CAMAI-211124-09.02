import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, UserCircle, Mail, Lock, Camera, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { BackButton } from './common/BackButton';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setFormData({
      username: profile?.username || '',
      email: user?.email || '',
      newPassword: '',
      confirmPassword: '',
      avatarUrl: profile?.avatar_url || ''
    });
  }, [profile, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!e.target.files || !e.target.files[0]) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}${fileExt ? `.${fileExt}` : ''}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      setFormData({ ...formData, avatarUrl: publicUrl });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update username if changed
      if (formData.username !== profile?.username) {
        await updateProfile({ username: formData.username });
      }

      // Update email if changed
      if (formData.email !== user?.email) {
        const { error } = await supabase.auth.updateUser({ email: formData.email });
        if (error) throw error;
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await supabase.auth.updateUser({ 
          password: formData.newPassword 
        });
        if (error) throw error;
      }

      setIsEditing(false);
      setFormData({ ...formData, newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Profile Settings</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {formData.avatarUrl ? (
                  <img 
                    src={formData.avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-gray-600" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-500 rounded-full cursor-pointer hover:bg-indigo-600 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile?.username}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <User className="w-4 h-4" />
                <span>Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {isEditing && (
              <>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>New Password</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-indigo-500 rounded-xl font-medium transition-colors hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData({
                    username: profile?.username || '',
                    email: user?.email || '',
                    newPassword: '',
                    confirmPassword: '',
                    avatarUrl: profile?.avatar_url || ''
                  });
                  setIsEditing(false);
                }}
                className="px-6 py-3 bg-gray-800 rounded-xl font-medium transition-colors hover:bg-gray-700"
              >
                Cancel
              </motion.button>
            </div>
          )}

          {/* Danger Zone */}
          {isEditing && (
            <div className="mt-12 p-6 border border-red-500/20 rounded-xl bg-red-500/10">
              <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </motion.button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
