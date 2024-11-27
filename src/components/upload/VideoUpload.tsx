import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Icons } from '@/components/ui/icons';
import { getMonthlyUploadStats, incrementUploadCount } from '@/lib/uploadLimits';
import { LocalVideoStorage } from '@/lib/localVideoStorage';
import type { UploadStats } from '@/lib/uploadLimits';

const videoStorage = new LocalVideoStorage();

export function VideoUpload() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      loadUploadStats();
    }
  }, [user, profile]);

  const loadUploadStats = async () => {
    if (!user || !profile) return;
    try {
      const stats = await getMonthlyUploadStats(user.id, profile.subscription_tier);
      setUploadStats(stats);
    } catch (err) {
      console.error('Error loading upload stats:', err);
      setError('Failed to load upload statistics');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !profile || !uploadStats) return;

    if (!uploadStats.canUpload) {
      setError('Upload limit reached. Please upgrade to PRO for unlimited uploads.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Save video locally
      await videoStorage.saveVideo(file, user.id);

      // Increment upload count in Supabase
      await incrementUploadCount(user.id);
      
      // Refresh upload stats
      await loadUploadStats();

      // Clear input
      event.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to save video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user || !profile) {
    return <div>Please log in to upload videos.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Upload Video</h1>
          {uploadStats && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Monthly Upload Stats</h2>
                <span className="text-sm text-gray-400">
                  {profile.subscription_tier === 'pro' ? 'PRO - Unlimited' : 'Basic Plan'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Uploads Used</span>
                    <span>{uploadStats.currentCount} / {uploadStats.limit === Infinity ? '∞' : uploadStats.limit}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-500 rounded-full h-2 transition-all duration-300"
                      style={{
                        width: `${uploadStats.limit === Infinity ? 0 : (uploadStats.currentCount / uploadStats.limit) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {uploadStats.limit !== Infinity && (
                  <div className="text-sm text-gray-400">
                    {uploadStats.remainingUploads} uploads remaining this month
                  </div>
                )}

                {!uploadStats.canUpload && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subscription')}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 flex items-center justify-center space-x-2"
                  >
                    <Icons.creditCard className="w-5 h-5" />
                    <span>Upgrade to PRO for Unlimited Uploads</span>
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <input
              type="file"
              onChange={handleFileUpload}
              accept="video/*"
              disabled={isUploading || (uploadStats && !uploadStats.canUpload)}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-500 file:text-white
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isUploading && (
              <div className="mt-4 flex items-center space-x-2 text-gray-400">
                <Icons.spinner className="w-5 h-5 animate-spin" />
                <span>Saving video...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
