import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efdhihonjfxzpxjrvwxd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZGhpaG9uamZ4enB4anJ2d3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NTY5NDgsImV4cCI6MjA0NzUzMjk0OH0.of5JpBT19zKYEhhiT2UBZYJW0ZHcITZtp4ogzIvefBU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
};

export const createStripeCheckout = async (priceId: string) => {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId }
  });
  
  if (error) throw error;
  return data.url;
};

export const cancelSubscription = async () => {
  const { error } = await supabase.functions.invoke('cancel-subscription');
  if (error) throw error;
};