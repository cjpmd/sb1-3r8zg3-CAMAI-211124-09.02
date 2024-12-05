import { Session, User, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { Database } from './database.types';

export type AuthProvider = 'email' | 'google' | 'facebook' | 'twitter';

export interface LoginOptions {
  provider: AuthProvider;
  email?: string;
  password?: string;
  redirectTo?: string;
  scopes?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status?: string;
  subscription_id?: string;
}

export interface AuthError extends SupabaseAuthError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthStore extends AuthState {
  signIn: (options: LoginOptions) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export type ProfilesTable = Database['public']['Tables']['profiles'];
export type ProfileRow = ProfilesTable['Row'];
export type ProfileInsert = ProfilesTable['Insert'];
export type ProfileUpdate = ProfilesTable['Update'];
