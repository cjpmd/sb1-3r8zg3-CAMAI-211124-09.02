import { supabase } from './supabase';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  platform: string;
}

interface RefreshResult {
  success: boolean;
  newTokens?: TokenData;
  error?: string;
}

const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

class TokenRefreshManager {
  private refreshTimers: Map<string, NodeJS.Timeout>;

  constructor() {
    this.refreshTimers = new Map();
  }

  async setupRefreshTimer(userId: string, platform: string, tokenData: TokenData) {
    // Clear existing timer if any
    this.clearRefreshTimer(userId, platform);

    if (!tokenData.expires_at || !tokenData.refresh_token) {
      console.warn(`No expiry or refresh token for ${platform}`);
      return;
    }

    const timeUntilRefresh = tokenData.expires_at - Date.now() - REFRESH_BUFFER;
    if (timeUntilRefresh <= 0) {
      // Token is already expired or about to expire, refresh now
      await this.refreshToken(userId, platform, tokenData);
      return;
    }

    // Set up timer for future refresh
    const timer = setTimeout(async () => {
      await this.refreshToken(userId, platform, tokenData);
    }, timeUntilRefresh);

    this.refreshTimers.set(`${userId}-${platform}`, timer);
  }

  clearRefreshTimer(userId: string, platform: string) {
    const key = `${userId}-${platform}`;
    const existingTimer = this.refreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.refreshTimers.delete(key);
    }
  }

  private async refreshToken(userId: string, platform: string, tokenData: TokenData): Promise<RefreshResult> {
    try {
      let newTokens: TokenData | null = null;

      switch (platform) {
        case 'twitter':
          newTokens = await this.refreshTwitterToken(tokenData);
          break;
        case 'facebook':
          newTokens = await this.refreshFacebookToken(tokenData);
          break;
        case 'instagram':
          newTokens = await this.refreshInstagramToken(tokenData);
          break;
        case 'linkedin':
          newTokens = await this.refreshLinkedInToken(tokenData);
          break;
        case 'youtube':
          newTokens = await this.refreshYouTubeToken(tokenData);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      if (!newTokens) {
        throw new Error('Failed to refresh token');
      }

      // Update tokens in database
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: newTokens.expires_at
        })
        .eq('user_id', userId)
        .eq('platform', platform);

      if (updateError) {
        throw updateError;
      }

      // Set up next refresh timer
      await this.setupRefreshTimer(userId, platform, newTokens);

      return {
        success: true,
        newTokens
      };
    } catch (error) {
      console.error(`Error refreshing ${platform} token:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async refreshTwitterToken(tokenData: TokenData): Promise<TokenData> {
    // Implement Twitter-specific token refresh logic
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token!,
        client_id: process.env.VITE_X_CLIENT_ID!,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh Twitter token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      platform: 'twitter'
    };
  }

  private async refreshFacebookToken(tokenData: TokenData): Promise<TokenData> {
    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.VITE_FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.VITE_FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${tokenData.access_token}`
    );

    if (!response.ok) {
      throw new Error(`Failed to refresh Facebook token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      platform: 'facebook'
    };
  }

  private async refreshInstagramToken(tokenData: TokenData): Promise<TokenData> {
    // Instagram uses the same token refresh as Facebook
    return this.refreshFacebookToken(tokenData);
  }

  private async refreshLinkedInToken(tokenData: TokenData): Promise<TokenData> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token!,
        client_id: process.env.VITE_LINKEDIN_CLIENT_ID!,
        client_secret: process.env.VITE_LINKEDIN_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh LinkedIn token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      platform: 'linkedin'
    };
  }

  private async refreshYouTubeToken(tokenData: TokenData): Promise<TokenData> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token!,
        client_id: process.env.VITE_YOUTUBE_CLIENT_ID!,
        client_secret: process.env.VITE_YOUTUBE_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh YouTube token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      platform: 'youtube'
    };
  }
}

export const tokenRefreshManager = new TokenRefreshManager();
