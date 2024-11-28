export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contents: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
          media_urls: string[]
          status: 'draft' | 'scheduled' | 'published' | 'failed'
          scheduled_for: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
          media_urls?: string[]
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
          media_urls?: string[]
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          settings?: {
            darkMode: boolean
            notifications: boolean
            autoBackup: boolean
          }
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          settings?: {
            darkMode?: boolean
            notifications?: boolean
            autoBackup?: boolean
          }
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          settings?: {
            darkMode?: boolean
            notifications?: boolean
            autoBackup?: boolean
          }
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: string
          username: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          profile_picture: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          username: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          username?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_platforms: {
        Row: {
          id: string
          user_id: string
          platform_name: string
          platform_url: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_name: string
          platform_url: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_name?: string
          platform_url?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
      video_uploads: {
        Row: {
          id: string
          user_id: string
          upload_month: string
          upload_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          upload_month: string
          upload_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          upload_month?: string
          upload_count?: number
          created_at?: string
          updated_at?: string
        }
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
      platform_type: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'] 
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Content = Tables<'contents'>
export type Profile = Tables<'profiles'>
export type SocialAccount = Tables<'social_accounts'>
export type CustomPlatform = Tables<'custom_platforms'>
export type VideoUpload = Tables<'video_uploads'>
