import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Content {
  id: string;
  title: string;
  description: string;
  platform: string;
  media_urls: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

interface ContentStore {
  contents: Content[];
  loading: boolean;
  error: string | null;
  fetchContents: () => Promise<void>;
  createContent: (data: {
    title: string;
    description: string;
    platform: string;
    files: File[];
    scheduledFor: Date | null;
  }) => Promise<void>;
  updateContent: (id: string, data: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  publishContent: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentStore>((set, get) => ({
  contents: [],
  loading: false,
  error: null,

  fetchContents: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ contents: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createContent: async ({ title, description, platform, files, scheduledFor }) => {
    set({ loading: true, error: null });
    try {
      // 1. Upload media files
      const mediaUrls = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `content/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // 2. Create content record
      const { data, error } = await supabase
        .from('contents')
        .insert({
          title,
          description,
          platform,
          media_urls: mediaUrls,
          status: scheduledFor ? 'scheduled' : 'draft',
          scheduled_for: scheduledFor?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Update local state
      const { contents } = get();
      set({ contents: [data, ...contents] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateContent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('contents')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      const { contents } = get();
      set({
        contents: contents.map((content) =>
          content.id === id ? { ...content, ...data } : content
        ),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteContent: async (id) => {
    set({ loading: true, error: null });
    try {
      const content = get().contents.find((c) => c.id === id);
      if (!content) throw new Error('Content not found');

      // 1. Delete media files
      await Promise.all(
        content.media_urls.map(async (url) => {
          const filePath = url.split('/').pop();
          if (!filePath) return;

          const { error } = await supabase.storage
            .from('media')
            .remove([`content/${filePath}`]);

          if (error) throw error;
        })
      );

      // 2. Delete content record
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 3. Update local state
      const { contents } = get();
      set({ contents: contents.filter((c) => c.id !== id) });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  publishContent: async (id) => {
    set({ loading: true, error: null });
    try {
      const content = get().contents.find((c) => c.id === id);
      if (!content) throw new Error('Content not found');

      // TODO: Implement platform-specific posting logic
      // For now, just mark as published
      await get().updateContent(id, { status: 'published' });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
