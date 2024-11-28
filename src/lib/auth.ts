import { supabase } from './supabase';
import { AuthState, Profile } from '../types/supabase';

export interface UserTokens {
  instagram?: {
    accessToken: string;
    userId: string;
  };
  tiktok?: {
    accessToken: string;
    userId: string;
  };
  youtube?: {
    accessToken: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  };
  facebook?: {
    accessToken: string;
    pageId: string;
  };
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile;
}

export async function getUserTokens(userId: string): Promise<UserTokens> {
  const { data, error } = await supabase
    .from('user_social_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error('Failed to fetch user tokens');
  }

  return {
    instagram: data.instagram_tokens,
    tiktok: data.tiktok_tokens,
    youtube: data.youtube_tokens,
    facebook: data.facebook_tokens,
  };
}

export async function getSocialTokens(userId: string) {
  const { data: tokens, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching social tokens:', error);
    return {
      instagram: null,
      tiktok: null,
      youtube: null,
      facebook: null,
    };
  }

  return {
    instagram: tokens.find((t) => t.platform === 'instagram'),
    tiktok: tokens.find((t) => t.platform === 'tiktok'),
    youtube: tokens.find((t) => t.platform === 'youtube'),
    facebook: tokens.find((t) => t.platform === 'facebook'),
  };
}

export async function updateSocialTokens(userId: string, tokens: Record<string, any>) {
  const { error } = await supabase
    .from('social_accounts')
    .upsert({
      user_id: userId,
      ...tokens,
    });

  if (error) {
    console.error('Error updating social tokens:', error);
    throw error;
  }
}

export async function updateUserTokens(
  userId: string,
  platform: keyof UserTokens,
  tokens: UserTokens[keyof UserTokens]
) {
  const column = `${platform}_tokens`;
  const { error } = await supabase
    .from('user_social_tokens')
    .upsert({
      user_id: userId,
      [column]: tokens,
    });

  if (error) {
    throw new Error(`Failed to update ${platform} tokens`);
  }
}

export async function getAuthState(): Promise<AuthState> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting auth state:', error);
    return {
      user: null,
      profile: null,
      loading: false,
      updateProfile: async () => {},
    };
  }

  const profile = user ? await getUserProfile(user.id) : null;

  return {
    user,
    profile,
    loading: false,
    updateProfile: async (updates) => {
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
    },
  };
}
