export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  settings?: {
    darkMode: boolean;
    notifications: boolean;
    autoBackup: boolean;
  };
  subscription_tier?: 'free' | 'pro';
  created_at?: string;
  updated_at?: string;
}
