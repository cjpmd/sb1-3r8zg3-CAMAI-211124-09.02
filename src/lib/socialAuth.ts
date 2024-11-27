import { supabase } from './supabase';
import { SocialPlatform, SocialAccount } from '../types/social';

const INSTAGRAM_CLIENT_ID = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
const TIKTOK_CLIENT_ID = import.meta.env.VITE_TIKTOK_CLIENT_ID;
const YOUTUBE_CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
const FACEBOOK_CLIENT_ID = import.meta.env.VITE_FACEBOOK_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

export const socialAuthConfig = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['basic', 'publish_media', 'pages_show_list'],
    clientId: INSTAGRAM_CLIENT_ID,
  },
  tiktok: {
    authUrl: 'https://open-api.tiktok.com/platform/oauth/connect/',
    scopes: ['user.info.basic', 'video.list', 'video.upload'],
    clientId: TIKTOK_CLIENT_ID,
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly'
    ],
    clientId: YOUTUBE_CLIENT_ID,
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scopes: ['pages_show_list', 'pages_manage_posts', 'pages_read_engagement'],
    clientId: FACEBOOK_CLIENT_ID,
  },
};

export const initiateSocialAuth = (platform: SocialPlatform) => {
  const config = socialAuthConfig[platform];
  const state = Math.random().toString(36).substring(7);
  
  // Store state for verification
  localStorage.setItem('socialAuthState', state);
  localStorage.setItem('socialAuthPlatform', platform);

  const params = new URLSearchParams({
    client_id: config.clientId!,
    redirect_uri: REDIRECT_URI,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state,
  });

  window.location.href = `${config.authUrl}?${params.toString()}`;
};

export const handleSocialAuthCallback = async (
  code: string,
  state: string,
  platform: SocialPlatform
): Promise<SocialAccount> => {
  const storedState = localStorage.getItem('socialAuthState');
  const storedPlatform = localStorage.getItem('socialAuthPlatform');

  if (state !== storedState || platform !== storedPlatform) {
    throw new Error('Invalid auth state');
  }

  // Clear stored state
  localStorage.removeItem('socialAuthState');
  localStorage.removeItem('socialAuthPlatform');

  // Exchange code for tokens using your backend
  const response = await fetch('/api/social/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, platform }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange auth code');
  }

  const data = await response.json();

  // Store account in Supabase
  const { data: account, error } = await supabase
    .from('social_accounts')
    .upsert({
      platform,
      user_id: supabase.auth.user()?.id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
      username: data.username,
      profile_picture: data.profile_picture,
    })
    .single();

  if (error) throw error;

  return {
    id: account.id,
    platform: account.platform,
    username: account.username,
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
    expiresAt: account.expires_at,
    profilePicture: account.profile_picture,
  };
};

export const getSocialAccounts = async (): Promise<SocialAccount[]> => {
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', supabase.auth.user()?.id);

  if (error) throw error;

  return accounts.map(account => ({
    id: account.id,
    platform: account.platform,
    username: account.username,
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
    expiresAt: account.expires_at,
    profilePicture: account.profile_picture,
  }));
};

export const disconnectSocialAccount = async (platform: SocialPlatform) => {
  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .match({ 
      platform, 
      user_id: supabase.auth.user()?.id 
    });

  if (error) throw error;
};
