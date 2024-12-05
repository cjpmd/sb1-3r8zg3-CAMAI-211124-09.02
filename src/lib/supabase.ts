import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Initialize auth state
export const initializeAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session) {
      console.log('Found existing session:', session.user?.id);
    } else {
      console.log('No existing session found');
    }
    
    return session;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
};

// Add auth state change listener for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, userId: session?.user?.id });
});

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking auth:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('Error in isAuthenticated:', error);
    return false;
  }
};

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  subscription_tier?: string;
  subscription_status?: string;
  created_at: string;
  settings?: {
    darkMode: boolean;
    notifications: boolean;
    autoBackup: boolean;
  };
}

// Get user profile
export const getProfile = async (userId: string) => {
  if (!userId) {
    console.error('getProfile called with null/undefined userId');
    return null;
  }

  try {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

// Update user password
export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Sign out helper
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};