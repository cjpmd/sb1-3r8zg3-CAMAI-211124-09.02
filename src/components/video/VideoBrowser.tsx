import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { LocalVideoStorage, type VideoMetadata } from '@/lib/localVideoStorage';
import { VideoPlayer } from './VideoPlayer';
import { Icons } from '@/components/ui/icons';

const videoStorage = new LocalVideoStorage();

export function VideoBrowser() {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);

  useEffect(() => {
    if (user) {
      loadVideos();
    }
  }, [user]);

  const loadVideos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userVideos = await videoStorage.getUserVideos(user.id);
      setVideos(userVideos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (video: VideoMetadata) => {
    if (!user) return;

    try {
      await videoStorage.deleteVideo(video);
      await loadVideos();
      if (selectedVideo?.id === video.id) {
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  if (!user) {
    return <div>Please log in to view your videos.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Videos</h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Icons.spinner className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Icons.video className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-400">Upload some videos to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {selectedVideo && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedVideo.originalName}</h2>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Icons.x className="w-5 h-5" />
                  </button>
                </div>
                <VideoPlayer metadata={selectedVideo} className="mb-4" />
                <div className="text-sm text-gray-400">
                  Uploaded on {new Date(selectedVideo.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  layoutId={video.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-900 relative group">
                    <VideoPlayer
                      metadata={video}
                      controls={false}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedVideo(video)}
                        className="p-2 bg-indigo-500 rounded-full"
                      >
                        <Icons.play className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(video)}
                        className="p-2 bg-red-500 rounded-full"
                      >
                        <Icons.trash className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 truncate">{video.originalName}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
