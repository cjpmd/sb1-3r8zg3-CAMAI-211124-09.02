import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Content {
  id: string;
  user_id: string;
  title: string;
  description: string;
  platform: SocialPlatform;
  media_urls: string[];
  status: ContentStatus;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

interface ContentState {
  contents: Content[];
  loading: boolean;
  error: string | null;
  fetchContents: () => Promise<void>;
  createContent: (content: Omit<Content, 'id' | 'created_at' | 'updated_at'>) => Promise<Content>;
  updateContent: (id: string, updates: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  publishContent: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  loading: false,
  error: null,

  fetchContents: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ contents: data as Content[] });
    } catch (error) {
      console.error('Error fetching contents:', error);
      set({ error: error instanceof Error ? error.message : 'Error fetching contents' });
    } finally {
      set({ loading: false });
    }
  },

  createContent: async (content) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('contents')
        .insert([content])
        .select()
        .single();

      if (error) throw error;
      
      const newContent = data as Content;
      set(state => ({ contents: [newContent, ...state.contents] }));
      return newContent;
    } catch (error) {
      console.error('Error creating content:', error);
      set({ error: error instanceof Error ? error.message : 'Error creating content' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateContent: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('contents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        contents: state.contents.map(content =>
          content.id === id ? { ...content, ...updates } : content
        )
      }));
    } catch (error) {
      console.error('Error updating content:', error);
      set({ error: error instanceof Error ? error.message : 'Error updating content' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteContent: async (id) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        contents: state.contents.filter(content => content.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting content:', error);
      set({ error: error instanceof Error ? error.message : 'Error deleting content' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  publishContent: async (id) => {
    try {
      set({ loading: true, error: null });
      const content = get().contents.find((c) => c.id === id);
      if (!content) throw new Error('Content not found');

      // TODO: Implement platform-specific posting logic
      // For now, just mark as published
      await get().updateContent(id, { status: 'published' });
    } catch (error) {
      console.error('Error publishing content:', error);
      set({ error: error instanceof Error ? error.message : 'Error publishing content' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
