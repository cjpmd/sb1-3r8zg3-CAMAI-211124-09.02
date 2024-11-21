import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';
import { useEditorStore } from '../../store/editorStore';

interface VideoPlayerProps {
  video: {
    id: string;
    url: string;
    caption: string;
    likes: number;
    userAvatar: string;
    username: string;
  };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const likeVideo = useVideoStore(state => state.likeVideo);
  const { selectedTheme, subtitlesEnabled } = useEditorStore();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              videoElement.play().catch(() => {});
            } else {
              videoElement.pause();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(videoElement);
      return () => observer.disconnect();
    }
  }, []);

  const handleVideoPress = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className={`relative h-[100dvh] w-full ${selectedTheme.background} touch-none`}>
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover"
        loop
        playsInline
        onClick={handleVideoPress}
        muted
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.div 
              className="flex items-center space-x-3 mb-2"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={video.userAvatar} 
                alt={video.username}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <span className={`${selectedTheme.textColor} font-semibold ${selectedTheme.fontFamily}`}>
                {video.username}
              </span>
            </motion.div>
            <p className={`${selectedTheme.textColor} ${selectedTheme.fontFamily} text-sm sm:text-base`}>
              {video.caption}
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => likeVideo(video.id)}
              className="flex flex-col items-center"
            >
              <Heart className="w-8 h-8 text-white hover:text-red-500 transition-colors" />
              <span className="text-white text-xs sm:text-sm">{video.likes}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <MessageCircle className="w-8 h-8 text-white hover:text-blue-500 transition-colors" />
              <span className="text-white text-xs sm:text-sm">234</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <Share2 className="w-8 h-8 text-white hover:text-green-500 transition-colors" />
              <span className="text-white text-xs sm:text-sm">Share</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};