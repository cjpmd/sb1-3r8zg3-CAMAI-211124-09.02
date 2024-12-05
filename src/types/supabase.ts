import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

import { Database } from './database.types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Platform = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'custom'
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'pending'

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

export type Profile = Tables['profiles']['Row'];
export type SocialAccount = Tables['social_accounts']['Row'];
export type Content = Tables['contents']['Row'];
export type VideoUpload = Tables['video_uploads']['Row'];
export type CustomPlatform = Tables['custom_platforms']['Row'];

export type SocialPlatform = 'tiktok' | 'facebook' | 'instagram' | 'youtube' | 'x';

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export interface ContentSuggestion {
  title: string;
  description: string;
}

export interface MediaFile {
  file: File;
  preview: string;
  type: 'video' | 'image';
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  socialAccounts: SocialAccount[];
  isLoading: boolean;
  error: Error | null;
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  setSocialAccounts: (accounts: SocialAccount[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loadProfile: () => Promise<void>
  loadSocialAccounts: () => Promise<void>
}

export type Session = SupabaseSession
export type User = SupabaseUser
