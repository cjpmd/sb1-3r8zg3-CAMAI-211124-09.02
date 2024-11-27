import { create } from 'zustand';
import { saveVideo, getAllVideos, deleteVideo, initDB } from '../lib/db';

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
  error: string | null;
  loadVideos: () => Promise<void>;
  addVideo: (videoData: Omit<Video, 'url' | 'timestamp'>) => Promise<void>;
  likeVideo: (id: string) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  loading: true,
  error: null,
  loadVideos: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Initializing DB...');
      await initDB();
      
      console.log('Loading videos from DB...');
      const dbVideos = await getAllVideos();
      console.log('Loaded videos:', dbVideos.length);
      
      const videos = dbVideos.map(video => ({
        ...video,
        url: URL.createObjectURL(video.blob)
      }));
      
      set({ videos, loading: false, error: null });
    } catch (error: any) {
      console.error('Error loading videos:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },
  addVideo: async (videoData) => {
    try {
      const newVideo = {
        ...videoData,
        timestamp: Date.now()
      };
      await saveVideo(newVideo);
      const url = URL.createObjectURL(videoData.blob);
      set(state => ({
        videos: [{ ...newVideo, url }, ...state.videos],
        error: null
      }));
    } catch (error: any) {
      console.error('Error adding video:', error);
      set({ error: error.message });
      throw error;
    }
  },
  likeVideo: async (id) => {
    try {
      set(state => ({
        videos: state.videos.map(video =>
          video.id === id ? { ...video, likes: video.likes + 1 } : video
        ),
        error: null
      }));
    } catch (error: any) {
      console.error('Error liking video:', error);
      set({ error: error.message });
      throw error;
    }
  },
  deleteVideo: async (id) => {
    try {
      await deleteVideo(id);
      set(state => ({
        videos: state.videos.filter(video => video.id !== id),
        error: null
      }));
    } catch (error: any) {
      console.error('Error deleting video:', error);
      set({ error: error.message });
      throw error;
    }
  }
}));