import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video as VideoIcon, Upload, X, Play, Pause, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { BackButton } from './common/BackButton';
import { isMobile } from '../utils/device';

interface VideoFile {
  id: string;
  url: string;
  name: string;
  timestamp: number;
  thumbnailUrl?: string;
}

export const VideoBrowser = () => {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .storage
        .from('videos')
        .list(`${user?.id}/`, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (fetchError) throw fetchError;

      const videoFiles: VideoFile[] = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('videos')
            .getPublicUrl(`${user?.id}/${file.name}`);

          return {
            id: file.id,
            url: publicUrl,
            name: file.name,
            timestamp: new Date(file.created_at).getTime()
          };
        })
      );

      setVideos(videoFiles);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.currentTime = 1; // Seek to 1 second

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(thumbnailUrl);
      };
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt ? `.${fileExt}` : ''}`;
        const filePath = `${user?.id}/${fileName}`;
        const thumbnailUrl = await generateThumbnail(file);

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              setUploadProgress(Math.round(percentage));
            }
          });

        if (uploadError) throw uploadError;

        return {
          id: fileName,
          url: supabase.storage.from('videos').getPublicUrl(filePath).data.publicUrl,
          name: fileName,
          timestamp: Date.now(),
          thumbnailUrl
        };
      });

      const newVideos = await Promise.all(uploadPromises);
      setVideos(prev => [...newVideos, ...prev]);
    } catch (err) {
      console.error('Error uploading videos:', err);
      setError('Failed to upload videos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (video: VideoFile) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from('videos')
        .remove([`${user?.id}/${video.name}`]);

      if (deleteError) throw deleteError;

      setVideos(prev => prev.filter(v => v.id !== video.id));
      if (selectedVideo?.id === video.id) {
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  const openFilePicker = () => {
    if (isMobile()) {
      fileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const togglePlay = () => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.pause();
      } else {
        videoPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Video Library</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openFilePicker}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Uploading {uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </>
            )}
          </motion.button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          capture={isMobile() ? "environment" : undefined}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <VideoIcon className="w-16 h-16 mb-4" />
            <p className="text-xl font-medium mb-2">No videos yet</p>
            <p className="text-sm">Upload some videos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                layoutId={video.id}
                className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer bg-gray-800"
                onClick={() => setSelectedVideo(video)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(video);
                    }}
                    className="absolute bottom-4 right-4 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
              onClick={() => {
                setSelectedVideo(null);
                setIsPlaying(false);
              }}
            >
              <div className="absolute top-4 right-4 flex space-x-4">
                <button
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                <button
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => {
                    setSelectedVideo(null);
                    setIsPlaying(false);
                  }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative max-w-4xl w-full aspect-video" onClick={e => e.stopPropagation()}>
                <video
                  ref={videoPlayerRef}
                  src={selectedVideo.url}
                  className="w-full h-full rounded-lg"
                  controls
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                >
                  {isPlaying ? (
                    <Pause className="w-16 h-16" />
                  ) : (
                    <Play className="w-16 h-16" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
