export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  subscription_tier?: 'free' | 'pro';
  created_at?: string;
  updated_at?: string;
}
