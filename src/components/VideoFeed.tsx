import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useVideoStore } from '../store/videoStore';
import { VideoPlayer } from './VideoPlayer/VideoPlayer';

export const VideoFeed = () => {
  const videos = useVideoStore((state) => state.videos);

  return (
    <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {videos.map((video) => (
        <div key={video.id} className="snap-start h-[100dvh] w-full">
          <VideoPlayer video={video} />
        </div>
      ))}
    </div>
  );
};