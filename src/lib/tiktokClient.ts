// TikTok API configuration
export const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
export const TIKTOK_CLIENT_SECRET = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
export const TIKTOK_REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI || 'https://camai-dev.vercel.app/auth/tiktok/callback';

// Debug environment variables
console.log('TikTok Environment Variables:', {
  TIKTOK_CLIENT_KEY: TIKTOK_CLIENT_KEY ? 'Set' : 'Not Set',
  TIKTOK_CLIENT_SECRET: TIKTOK_CLIENT_SECRET ? 'Set' : 'Not Set',
  TIKTOK_REDIRECT_URI,
});

if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
  console.error('TikTok API credentials are not configured properly. Please check your environment variables.');
}

// TikTok OAuth URLs
export const TIKTOK_AUTH_URL = 'https://www.tiktok.com/auth/authorize/';

// Scopes needed for the application
export const TIKTOK_SCOPES = [
  'user.info.basic',
  'video.list'
].join(',');

// Generate TikTok OAuth URL
export const getTikTokAuthUrl = () => {
  if (!TIKTOK_CLIENT_KEY) {
    const error = new Error('TikTok client key is not configured. Please check your environment variables.');
    console.error(error);
    throw error;
  }

  const csrfToken = Math.random().toString(36).substring(2);
  localStorage.setItem('tiktok_csrf_token', csrfToken);
  localStorage.setItem('auth_return_url', window.location.pathname);
  
  try {
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      redirect_uri: TIKTOK_REDIRECT_URI,
      scope: TIKTOK_SCOPES,
      response_type: 'code',
      state: csrfToken
    });

    const authUrl = `${TIKTOK_AUTH_URL}?${params.toString()}`;
    console.log('Generated TikTok auth URL:', authUrl);
    
    // Validate the URL before returning
    try {
      new URL(authUrl);
    } catch (e) {
      console.error('Invalid auth URL generated:', e);
      throw new Error('Failed to generate valid auth URL');
    }

    return authUrl;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
};

// Exchange code for access token
export const exchangeCodeForToken = async (code: string) => {
  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
    throw new Error('TikTok API credentials are not configured properly.');
  }

  try {
    console.log('Exchanging code for token with redirect URI:', TIKTOK_REDIRECT_URI);
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('TikTok token exchange error:', errorData);
      throw new Error(errorData.message || 'Failed to exchange code for token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Types for TikTok responses
export interface TikTokUser {
  open_id: string;
  union_id: string;
  avatar_url: string;
  avatar_url_100: string;
  avatar_large_url: string;
  display_name: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}
