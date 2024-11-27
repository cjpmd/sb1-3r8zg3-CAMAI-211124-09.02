import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  subscription_tier?: 'free' | 'pro';
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  loadProfile: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  refreshSession: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      await get().setSession(session);
    } catch (error: any) {
      console.error('Refresh session error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await get().setSession(data.session);
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      if (data.session) {
        await get().setSession(data.session);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setSession: async (session) => {
    try {
      set({ session });
      
      if (session?.user) {
        await get().loadProfile();
      } else {
        set({ profile: null });
      }
    } catch (error: any) {
      console.error('Set session error:', error);
      set({ error: error.message });
    }
  },

  loadProfile: async () => {
    const state = get();
    if (!state.session?.user?.id) return;

    try {
      set({ loading: true, error: null });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .single()
        .eq('id', state.session.user.id);

      if (error) throw error;
      
      set({ profile });
    } catch (error: any) {
      console.error('Load profile error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ session: null, profile: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Failed to initialize auth:', error);
    useAuthStore.setState({ error: error.message, loading: false });
    return;
  }

  useAuthStore.getState().setSession(session);
}).finally(() => {
  useAuthStore.setState({ loading: false });
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});