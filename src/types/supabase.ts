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
