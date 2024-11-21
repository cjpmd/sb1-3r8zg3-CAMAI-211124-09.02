import { create } from 'zustand';
import { supabase, getProfile, Profile, updateProfile as updateSupabaseProfile } from '../lib/supabase';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: any) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    const profile = await getProfile(data.user.id);
    if (!profile) throw new Error('Profile not found');
    
    set({ user: data.user, session: data.session, profile });
  },
  signUp: async (email, password, username) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          subscription_tier: 'free',
          subscription_status: 'inactive'
        });
      
      if (profileError) throw profileError;

      const profile = await getProfile(authData.user.id);
      if (!profile) throw new Error('Profile not found');
      
      set({ user: authData.user, session: authData.session, profile });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },
  setSession: async (session) => {
    set({ user: session?.user ?? null, session, loading: false });
    if (session?.user) {
      const profile = await getProfile(session.user.id);
      if (!profile) throw new Error('Profile not found');
      set({ profile });
    }
  },
  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    await updateSupabaseProfile(user.id, updates);
    const profile = await getProfile(user.id);
    if (!profile) throw new Error('Profile not found');
    set({ profile });
  },
}));