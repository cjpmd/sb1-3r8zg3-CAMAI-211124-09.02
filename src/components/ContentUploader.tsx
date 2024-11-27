import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Calendar, Tag, MapPin, Globe, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getSocialAccounts, initiateSocialAuth } from '../lib/socialAuth';
import { uploadToMultiplePlatforms } from '../lib/socialUpload';
import { SocialPlatform, SocialAccount, UploadOptions, UploadProgress } from '../types/social';
import { BackButton } from './common/BackButton';
import { isMobile } from '../utils/device';

const platformIcons = {
  instagram: '/icons/instagram.svg',
  tiktok: '/icons/tiktok.svg',
  youtube: '/icons/youtube.svg',
  facebook: '/icons/facebook.svg',
};

const platformNames = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
};

export const ContentUploader = () => {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<SocialPlatform, UploadProgress>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const accounts = await getSocialAccounts();
      setConnectedAccounts(accounts);
    } catch (err) {
      console.error('Error loading social accounts:', err);
      setError('Failed to load connected accounts');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const togglePlatform = (platform: SocialPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || selectedPlatforms.length === 0) {
      setError('Please select a file and at least one platform');
      return;
    }

    setUploading(true);
    setError(null);

    const options: UploadOptions = {
      title,
      description,
      thumbnail,
      platforms: selectedPlatforms,
      scheduledTime: scheduledTime || undefined,
      tags,
      location,
      visibility,
    };

    try {
      const results = await uploadToMultiplePlatforms(selectedFile, options, {
        onProgress: (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [progress.platform]: progress
          }));
        }
      });

      const errors = results.filter(result => !result.success);
      if (errors.length > 0) {
        setError(`Upload failed for some platforms: ${errors.map(e => platformNames[e.platform]).join(', ')}`);
      }

      // Reset form if all uploads successful
      if (errors.length === 0) {
        resetForm();
      }
    } catch (err) {
      console.error('Error uploading content:', err);
      setError('Failed to upload content');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setThumbnail(null);
    setTitle('');
    setDescription('');
    setTags([]);
    setLocation('');
    setScheduledTime(null);
    setVisibility('public');
    setSelectedPlatforms([]);
    setUploadProgress({});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Upload Content</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* File Selection */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Content</h2>
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-indigo-400">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-gray-400">
                      Click to select or drag and drop your file
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Platforms</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(platformIcons) as SocialPlatform[]).map((platform) => {
                const isConnected = connectedAccounts.some(account => account.platform === platform);
                const isSelected = selectedPlatforms.includes(platform);

                return (
                  <motion.div
                    key={platform}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => isConnected ? togglePlatform(platform) : initiateSocialAuth(platform)}
                    className={`relative p-4 rounded-lg cursor-pointer ${
                      isConnected
                        ? isSelected
                          ? 'bg-indigo-500 border-2 border-indigo-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-700 opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={platformIcons[platform]}
                        alt={platform}
                        className="w-6 h-6"
                      />
                      <span>{platformNames[platform]}</span>
                    </div>
                    {!isConnected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <Plus className="w-6 h-6" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Details</h2>

            {/* Title & Description */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Add tags (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="hover:text-indigo-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Schedule */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={scheduledTime?.toISOString().slice(0, 16) || ''}
                onChange={(e) => setScheduledTime(e.target.value ? new Date(e.target.value) : null)}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Visibility */}
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'unlisted')}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Upload Progress</h2>
              {Object.entries(uploadProgress).map(([platform, progress]) => (
                <div key={platform} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{platformNames[platform as SocialPlatform]}</span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={uploading || !selectedFile || selectedPlatforms.length === 0}
            className={`w-full py-4 rounded-xl font-semibold ${
              uploading || !selectedFile || selectedPlatforms.length === 0
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Content'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
