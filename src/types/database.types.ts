export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<ProfileRow>
      }
      social_accounts: {
        Row: SocialAccountRow
        Insert: Omit<SocialAccountRow, 'id' | 'created_at'>
        Update: Partial<SocialAccountRow>
      }
      content: {
        Row: ContentRow
        Insert: Omit<ContentRow, 'id' | 'created_at'>
        Update: Partial<ContentRow>
      }
      video_uploads: {
        Row: VideoUploadRow
        Insert: Omit<VideoUploadRow, 'id' | 'created_at'>
        Update: Partial<VideoUploadRow>
      }
      custom_platforms: {
        Row: CustomPlatformRow
        Insert: Omit<CustomPlatformRow, 'id' | 'created_at'>
        Update: Partial<CustomPlatformRow>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_status: 'draft' | 'scheduled' | 'published' | 'failed'
      platform_type: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'twitter' | 'custom'
      video_status: 'pending' | 'processing' | 'ready' | 'failed'
    }
  }
}

export interface ProfileRow {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_status?: string
  subscription_id?: string
  stripe_customer_id?: string
}

export interface SocialAccountRow {
  id: string
  created_at: string
  user_id: string
  platform: Database['public']['Enums']['platform_type']
  platform_user_id: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  platform_username?: string
  platform_profile_url?: string
  is_active: boolean
}

export interface ContentRow {
  id: string
  created_at: string
  user_id: string
  title: string
  description?: string
  status: Database['public']['Enums']['content_status']
  scheduled_for?: string
  published_at?: string
  platform: Database['public']['Enums']['platform_type']
  platform_post_id?: string
  media_urls: string[]
  metadata: Json
}

export interface VideoUploadRow {
  id: string
  created_at: string
  user_id: string
  filename: string
  file_size: number
  duration?: number
  status: Database['public']['Enums']['video_status']
  url?: string
  thumbnail_url?: string
  error_message?: string
  metadata: Json
}

export interface CustomPlatformRow {
  id: string
  created_at: string
  user_id: string
  name: string
  api_endpoint: string
  api_key?: string
  webhook_url?: string
  is_active: boolean
  settings: Json
}
