import { create } from 'zustand';
import { saveVideo, getAllVideos, deleteVideo } from '../lib/db';

interface Video {
  id: string;
  blob: Blob;
  url: string;
  caption: string;
  likes: number;
  userAvatar: string;
  username: string;
  timestamp: number;
}

interface VideoStore {
  videos: Video[];
  loading: boolean;
  loadVideos: () => Promise<void>;
  addVideo: (videoData: Omit<Video, 'url' | 'timestamp'>) => Promise<void>;
  likeVideo: (id: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  loading: true,
  loadVideos: async () => {
    const dbVideos = await getAllVideos();
    const videos = dbVideos.map(video => ({
      ...video,
      url: URL.createObjectURL(video.blob)
    }));
    set({ videos, loading: false });
  },
  addVideo: async (videoData) => {
    const newVideo = {
      ...videoData,
      timestamp: Date.now()
    };
    await saveVideo(newVideo);
    const url = URL.createObjectURL(videoData.blob);
    set(state => ({
      videos: [{ ...newVideo, url }, ...state.videos]
    }));
  },
  likeVideo: async (id) => {
    set(state => ({
      videos: state.videos.map(video =>
        video.id === id ? { ...video, likes: video.likes + 1 } : video
      )
    }));
  },
  deleteVideo: async (id) => {
    await deleteVideo(id);
    set(state => ({
      videos: state.videos.filter(video => video.id !== id)
    }));
  }
}));