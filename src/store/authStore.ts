import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/profile';
import { Session } from '@supabase/supabase-js';

export interface AuthState {
  user: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  clearSession: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,
  clearSession: () => {},
  updateProfile: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
  loadProfile: async () => {},
  setSession: async () => {},
};

const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  clearSession: () => {
    supabase.auth.signOut();
    set({ user: null, session: null });
  },

  updateProfile: async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', get().user?.id)
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      set({ error: error.message });
      return;
    }

    set((state) => ({
      ...state,
      user: { ...state.user, ...updates } as Profile
    }));
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        await get().setSession(data.session);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message });
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
          data: {
            username,
          },
        },
      });

      if (error) throw error;
      if (data.session) {
        await get().setSession(data.session);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
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
      set({ user: null, session: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
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
      set({ user: profile });
    } catch (error: any) {
      console.error('Load profile error:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  setSession: async (session) => {
    try {
      set({ user: session?.user ?? null, session });
      if (session?.user) {
        await get().loadProfile();
      } else {
        set({ user: null });
      }
    } catch (error: any) {
      console.error('Set session error:', error);
      set({ error: error.message });
    }
  },
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