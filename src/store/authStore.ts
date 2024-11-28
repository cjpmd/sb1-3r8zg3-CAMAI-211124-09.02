import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/profile';

interface AuthState {
  user: any; // TODO: Replace with proper User type
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  clearSession: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  initialized: false,

  clearSession: () => {
    set({ user: null, profile: null, error: null });
  },

  updateProfile: async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.id)
        .single();

      if (error) throw error;
      if (data) {
        set((state) => ({
          ...state,
          profile: { ...state.profile, ...data } as Profile
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: 'Failed to update profile' });
    }
  },

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

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, profile: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  loadProfile: async () => {
    const state = get();
    if (!state.user?.id) return;

    try {
      set({ loading: true, error: null });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .single()
        .eq('id', state.user.id);

      if (error) throw error;
      
      set({ profile });
    } catch (error: any) {
      console.error('Load profile error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  setSession: async (session) => {
    try {
      set({ user: session.user, session });
      
      if (session.user) {
        await get().loadProfile();
      } else {
        set({ profile: null });
      }
    } catch (error: any) {
      console.error('Set session error:', error);
      set({ error: error.message });
    }
  }
}));

export default useAuthStore;

// Initialize auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Failed to initialize auth:', error);
    useAuthStore.setState({ error: error.message, loading: false });
    return;
  }

  useAuthStore.getState().setSession(session);
}).finally(() => {
  useAuthStore.setState({ loading: false, initialized: true });
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});