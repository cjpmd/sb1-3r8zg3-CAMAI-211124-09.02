import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { debugLog } from '@/utils/debug';

export interface Platform {
  id: string;
  name: string;
  connected: boolean;
  username?: string;
  settings?: {
    autoPost: boolean;
    crossPost: boolean;
    defaultPrivacy: 'public' | 'private';
    notifications: boolean;
  };
}

interface PlatformState {
  platforms: Platform[];
  loading: boolean;
  error: string | null;
  fetchPlatforms: (userId: string) => Promise<void>;
}

const defaultSettings = {
  autoPost: false,
  crossPost: true,
  defaultPrivacy: 'public' as const,
  notifications: true
};

const DEFAULT_PLATFORMS = Object.freeze([
  {
    id: "instagram",
    name: "Instagram",
    connected: false,
    settings: { ...defaultSettings }
  },
  {
    id: "tiktok",
    name: "TikTok",
    connected: false,
    settings: { ...defaultSettings }
  },
  {
    id: "youtube",
    name: "YouTube",
    connected: false,
    settings: { ...defaultSettings }
  },
  {
    id: "facebook",
    name: "Facebook",
    connected: false,
    settings: { ...defaultSettings }
  },
  {
    id: "x",
    name: "X",
    connected: false,
    settings: { ...defaultSettings }
  }
]);

export const usePlatformStore = create<PlatformState>((set) => ({
  platforms: DEFAULT_PLATFORMS,
  loading: false,
  error: null,
  fetchPlatforms: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data: connectedAccounts, error } = await supabase
        .from('social_accounts')
        .select('platform_id, username')
        .eq('user_id', userId);

      if (error) throw error;

      const updatedPlatforms = DEFAULT_PLATFORMS.map(platform => {
        const connectedAccount = connectedAccounts?.find(
          account => account.platform_id === platform.id
        );
        
        return {
          ...platform,
          connected: !!connectedAccount,
          username: connectedAccount?.username
        };
      });

      set({ platforms: updatedPlatforms, loading: false });
      debugLog('Platforms updated:', updatedPlatforms);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      set({ error: 'Failed to fetch platforms', loading: false });
    }
  }
}));
