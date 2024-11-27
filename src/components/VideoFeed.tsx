import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useVideoStore } from '../store/videoStore';
import { VideoPlayer } from './VideoPlayer/VideoPlayer';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackButton } from './common/BackButton';

export const VideoFeed = () => {
  const { videos, loading, loadVideos, error } = useVideoStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 150; // pixels to pull before refresh triggers

  useEffect(() => {
    console.log('VideoFeed mounted, loading videos...');
    loadVideos().catch(err => {
      console.error('Failed to load videos:', err);
      error = 'Failed to load videos. Please try again.';
    });
  }, [loadVideos]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      error = null;
      await loadVideos();
    } catch (err) {
      console.error('Refresh failed:', err);
      error = 'Failed to refresh feed. Please try again.';
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (document.documentElement.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold));
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold) {
      await handleRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center p-4 bg-red-500/10 rounded-lg m-4">
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-red-500">{message}</span>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
      <RefreshCw className="w-12 h-12 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
      <p className="text-center text-sm">Pull down to refresh or check back later</p>
    </div>
  );

  console.log('VideoFeed render:', { loading, videosCount: videos.length, error });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <BackButton />
        <div className="flex items-center justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <BackButton />
        <div className="text-center mt-20">
          <p className="text-red-500">Error loading videos: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white p-8 h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <BackButton />
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">Your Videos</h1>
        <AnimatePresence>
          {pullDistance > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: pullDistance }}
              exit={{ height: 0 }}
              className="flex items-center justify-center overflow-hidden bg-gray-900"
            >
              <RefreshCw
                className={`w-6 h-6 text-indigo-500 transition-transform ${
                  pullDistance >= threshold ? 'rotate-180' : ''
                }`}
                style={{
                  transform: `rotate(${(pullDistance / threshold) * 180}deg)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-800 rounded-xl p-4 snap-start">
              <VideoPlayer video={video} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};