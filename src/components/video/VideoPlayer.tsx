import React, { useRef, useEffect, useState } from 'react';
import type { VideoMetadata } from '@/lib/localVideoStorage';

interface VideoPlayerProps {
  metadata: VideoMetadata;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export function VideoPlayer({ metadata, autoPlay = false, controls = true, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoRef.current) return;

      try {
        const filePath = await window.api.getVideoPath(metadata.userId, metadata.filename);
        const { data } = await window.api.readVideo(filePath);

        // Create a blob URL from the video data
        const blob = new Blob([data], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // Set the video source
        videoRef.current.src = url;

        // Clean up the blob URL when the component unmounts or when the metadata changes
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error loading video:', error);
        setError('Failed to load video');
      }
    };

    loadVideo();
  }, [metadata]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={`w-full rounded-lg ${className}`}
      autoPlay={autoPlay}
      controls={controls}
      playsInline
    />
  );
}
