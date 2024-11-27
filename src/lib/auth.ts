import { supabase } from './supabase';

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
