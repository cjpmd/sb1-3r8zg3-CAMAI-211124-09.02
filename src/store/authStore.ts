import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export interface LoginOptions {
  provider: 'email' | 'google' | 'facebook' | 'twitter';
  email?: string;
  password?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (options: LoginOptions) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  error: null,

  signIn: async (options: LoginOptions) => {
    set({ isLoading: true, error: null });
    try {
      let authResponse;
      
      switch (options.provider) {
        case 'email':
          if (!options.email || !options.password) {
            throw new Error('Email and password are required');
          }
          authResponse = await supabase.auth.signInWithPassword({
            email: options.email,
            password: options.password,
          });
          break;
        case 'google':
          authResponse = await supabase.auth.signInWithOAuth({
            provider: 'google',
          });
          break;
        default:
          throw new Error('Unsupported auth provider');
      }

      if (authResponse.error) {
        throw authResponse.error;
      }

      const { data: { session, user } } = authResponse;
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        set({
          user,
          session,
          profile: profile as UserProfile,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: error as AuthError, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, profile: null, isLoading: false });
    } catch (error) {
      set({ error: error as AuthError, isLoading: false });
      throw error;
    }
  },

  refreshSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          session,
          profile: profile as UserProfile,
          isLoading: false,
        });
      } else {
        set({ user: null, session: null, profile: null, isLoading: false });
      }
    } catch (error) {
      set({ error: error as AuthError, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (profileUpdate: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      set({
        profile: data as UserProfile,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error as AuthError, isLoading: false });
      throw error;
    }
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  if (session) {
    store.setSession(session);
    store.setUser(session.user);
  } else {
    store.setSession(null);
    store.setUser(null);
  }
  store.setLoading(false);
});