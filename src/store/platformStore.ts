import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Platform, SocialAccount } from '../types/supabase'

interface PlatformState {
  platforms: SocialAccount[]
  loading: boolean
  error: string | null
  fetchPlatforms: (userId: string) => Promise<void>
  addPlatform: (platform: SocialAccount) => Promise<void>
  removePlatform: (platformId: string) => Promise<void>
  updatePlatform: (platformId: string, updates: Partial<SocialAccount>) => Promise<void>
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  platforms: [],
  loading: false,
  error: null,

  fetchPlatforms: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      set({ platforms: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching platforms:', error)
      set({ error: 'Failed to fetch platforms', loading: false })
    }
  },

  addPlatform: async (platform: SocialAccount) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('social_accounts')
        .insert(platform)

      if (error) throw error

      const { platforms } = get()
      set({ platforms: [...platforms, platform], loading: false })
    } catch (error) {
      console.error('Error adding platform:', error)
      set({ error: 'Failed to add platform', loading: false })
    }
  },

  removePlatform: async (platformId: string) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', platformId)

      if (error) throw error

      const { platforms } = get()
      set({
        platforms: platforms.filter(p => p.id !== platformId),
        loading: false
      })
    } catch (error) {
      console.error('Error removing platform:', error)
      set({ error: 'Failed to remove platform', loading: false })
    }
  },

  updatePlatform: async (platformId: string, updates: Partial<SocialAccount>) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', platformId)

      if (error) throw error

      const { platforms } = get()
      set({
        platforms: platforms.map(p =>
          p.id === platformId ? { ...p, ...updates } : p
        ),
        loading: false
      })
    } catch (error) {
      console.error('Error updating platform:', error)
      set({ error: 'Failed to update platform', loading: false })
    }
  }
}))
