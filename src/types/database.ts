export type Platform = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'custom';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'pending';

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  settings?: {
    darkMode: boolean;
    notifications: boolean;
    autoBackup: boolean;
  };
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: Platform;
  username: string;
  access_token: string;
  refresh_token?: string | null;
  expires_at?: string | null;
  profile_picture?: string | null;
  platform_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  user_id: string;
  title: string;
  description: string;
  platform: Platform;
  media_urls: string[];
  status: ContentStatus;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoUpload {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface CustomPlatform {
  id: string;
  user_id: string;
  platform_name: string;
  platform_url: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Profile>;
      };
      social_accounts: {
        Row: SocialAccount;
        Insert: Omit<SocialAccount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<SocialAccount>;
      };
      contents: {
        Row: Content;
        Insert: Omit<Content, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Content>;
      };
      video_uploads: {
        Row: VideoUpload;
        Insert: Omit<VideoUpload, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<VideoUpload>;
      };
      custom_platforms: {
        Row: CustomPlatform;
        Insert: Omit<CustomPlatform, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<CustomPlatform>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      Platform: Platform;
      ContentStatus: ContentStatus;
    };
  };
}
