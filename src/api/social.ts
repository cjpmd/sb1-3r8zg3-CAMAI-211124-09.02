import { supabase } from '@/lib/supabase';
import { tokenRefreshManager } from '../lib/tokenRefresh';
import {
  twitterRateLimiter,
  instagramRateLimiter,
  facebookRateLimiter,
  linkedinRateLimiter,
  youtubeRateLimiter
} from '../lib/rateLimit';

interface SocialPlatformConfig {
  name: string;
  baseUrl: string;
  rateLimiter: any;
  endpoints: {
    userInfo: string;
    post: string;
    media?: string;
  };
}

const PLATFORMS: { [key: string]: SocialPlatformConfig } = {
  twitter: {
    name: 'Twitter',
    baseUrl: 'https://api.twitter.com/2',
    rateLimiter: twitterRateLimiter,
    endpoints: {
      userInfo: '/users/me',
      post: '/tweets',
      media: '/media/upload'
    }
  },
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://graph.facebook.com/v12.0',
    rateLimiter: facebookRateLimiter,
    endpoints: {
      userInfo: '/me',
      post: '/me/feed',
      media: '/me/photos'
    }
  },
  instagram: {
    name: 'Instagram',
    baseUrl: 'https://graph.instagram.com',
    rateLimiter: instagramRateLimiter,
    endpoints: {
      userInfo: '/me',
      post: '/me/media',
      media: '/me/media'
    }
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://api.linkedin.com/v2',
    rateLimiter: linkedinRateLimiter,
    endpoints: {
      userInfo: '/me',
      post: '/ugcPosts',
      media: '/assets'
    }
  },
  youtube: {
    name: 'YouTube',
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    rateLimiter: youtubeRateLimiter,
    endpoints: {
      userInfo: '/channels',
      post: '/videos',
      media: '/upload'
    }
  }
};

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SocialApiWrapper {
  private userId: string;
  private retryAttempts = 3;
  private retryDelay = 1000; // ms

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getTokenData(platform: string) {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', this.userId)
      .eq('platform', platform)
      .single();

    if (error) throw error;
    if (!data) throw new Error(`No ${platform} account connected`);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      platform
    };
  }

  private async makeRequest(
    platform: string,
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<ApiResponse> {
    try {
      const config = PLATFORMS[platform];
      if (!config) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Check rate limit
      const rateLimitKey = `${this.userId}-${platform}`;
      await config.rateLimiter.checkLimit(rateLimitKey);

      // Get tokens
      const tokenData = await this.getTokenData(platform);

      // Set up request
      const url = `${config.baseUrl}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers
      };

      // Make request
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle response
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      // Handle token expiration
      if (response.status === 401 && attempt < this.retryAttempts) {
        // Try to refresh token
        const refreshResult = await tokenRefreshManager.refreshToken(
          this.userId,
          platform,
          tokenData
        );

        if (refreshResult.success) {
          // Retry with new token
          return this.makeRequest(platform, endpoint, options, attempt + 1);
        }
      }

      // Handle rate limiting
      if (response.status === 429 && attempt < this.retryAttempts) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '1');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeRequest(platform, endpoint, options, attempt + 1);
      }

      throw new Error(`${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.makeRequest(platform, endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getUserInfo(platform: string): Promise<ApiResponse> {
    const config = PLATFORMS[platform];
    if (!config) {
      return { success: false, error: `Unsupported platform: ${platform}` };
    }

    return this.makeRequest(platform, config.endpoints.userInfo);
  }

  async createPost(
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<ApiResponse> {
    const config = PLATFORMS[platform];
    if (!config) {
      return { success: false, error: `Unsupported platform: ${platform}` };
    }

    let mediaIds: string[] = [];

    // Upload media if provided
    if (mediaUrls && mediaUrls.length > 0 && config.endpoints.media) {
      for (const url of mediaUrls) {
        const mediaResponse = await this.uploadMedia(platform, url);
        if (!mediaResponse.success || !mediaResponse.data?.id) {
          return {
            success: false,
            error: `Failed to upload media: ${mediaResponse.error}`
          };
        }
        mediaIds.push(mediaResponse.data.id);
      }
    }

    // Create post with platform-specific payload
    const payload = this.createPlatformSpecificPayload(
      platform,
      content,
      mediaIds
    );

    return this.makeRequest(platform, config.endpoints.post, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  private async uploadMedia(
    platform: string,
    mediaUrl: string
  ): Promise<ApiResponse> {
    const config = PLATFORMS[platform];
    if (!config || !config.endpoints.media) {
      return { success: false, error: `Media upload not supported for ${platform}` };
    }

    // Download media
    const mediaResponse = await fetch(mediaUrl);
    if (!mediaResponse.ok) {
      return {
        success: false,
        error: `Failed to download media: ${mediaResponse.statusText}`
      };
    }

    const blob = await mediaResponse.blob();
    const formData = new FormData();
    formData.append('media', blob);

    return this.makeRequest(platform, config.endpoints.media, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  private createPlatformSpecificPayload(
    platform: string,
    content: string,
    mediaIds: string[]
  ): any {
    switch (platform) {
      case 'twitter':
        return {
          text: content,
          ...(mediaIds.length > 0 && {
            media: { media_ids: mediaIds }
          })
        };

      case 'facebook':
        return {
          message: content,
          ...(mediaIds.length > 0 && {
            attached_media: mediaIds.map(id => ({ media_fbid: id }))
          })
        };

      case 'instagram':
        // Instagram requires media
        if (mediaIds.length === 0) {
          throw new Error('Instagram posts require media');
        }
        return {
          media_type: mediaIds.length > 1 ? 'CAROUSEL' : 'IMAGE',
          children: mediaIds,
          caption: content
        };

      case 'linkedin':
        return {
          author: `urn:li:person:${this.userId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content
              },
              ...(mediaIds.length > 0 && {
                media: mediaIds.map(id => ({
                  status: 'READY',
                  media: id
                }))
              })
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        };

      case 'youtube':
        // YouTube requires different endpoints and flow for videos
        return {
          snippet: {
            title: content.slice(0, 100), // YouTube requires a title
            description: content,
            tags: [],
            categoryId: '22' // People & Blogs
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false
          }
        };

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

export async function exchangeToken(code: string, platform: string, redirectUri: string) {
  console.log('Starting token exchange for platform:', platform);
  
  const clientId = import.meta.env[`VITE_${platform.toUpperCase()}_CLIENT_ID`];
  const clientSecret = import.meta.env[`VITE_${platform.toUpperCase()}_CLIENT_SECRET`];
  const verifier = sessionStorage.getItem('oauth_verifier');

  console.log('Credentials:', { clientId, hasSecret: !!clientSecret, hasVerifier: !!verifier });

  let tokenUrl = '';
  let body: Record<string, string> = {
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  let headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  switch (platform) {
    case 'instagram':
      tokenUrl = 'https://api.instagram.com/oauth/access_token';
      body.client_secret = clientSecret;
      break;

    case 'facebook':
      tokenUrl = 'https://graph.facebook.com/v12.0/oauth/access_token';
      body.client_secret = clientSecret;
      break;

    case 'youtube':
      tokenUrl = 'https://oauth2.googleapis.com/token';
      body.client_secret = clientSecret;
      break;

    case 'x':
      tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      body.code_verifier = verifier || '';
      headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      };
      break;

    default:
      throw new Error('Unsupported platform');
  }

  console.log('Making token request to:', tokenUrl);
  console.log('Request body:', body);
  console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers,
    body: new URLSearchParams(body),
  });

  console.log('Token response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Token exchange error:', error);
    throw new Error(error.error_description || error.message || 'Failed to exchange token');
  }

  const data = await response.json();
  console.log('Token exchange successful');

  // Get user info based on platform
  let userInfo: any = {};
  
  try {
    console.log('Fetching user info...');
    
    switch (platform) {
      case 'instagram':
        const igResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token}`);
        userInfo = await igResponse.json();
        break;

      case 'facebook':
        const fbResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${data.access_token}`);
        userInfo = await fbResponse.json();
        break;

      case 'youtube':
        const ytResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const ytData = await ytResponse.json();
        userInfo = {
          id: ytData.items[0].id,
          username: ytData.items[0].snippet.title,
          profile_picture: ytData.items[0].snippet.thumbnails.default.url,
        };
        break;

      case 'x':
        const xResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const xData = await xResponse.json();
        userInfo = {
          id: xData.data.id,
          username: xData.data.username,
          profile_picture: xData.data.profile_image_url,
        };
        break;
    }
    
    console.log('User info fetched successfully:', { 
      id: userInfo.id,
      username: userInfo.username || userInfo.name
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    platform_user_id: userInfo.id,
    username: userInfo.username || userInfo.name,
    profile_picture: userInfo.profile_picture || userInfo.picture?.data?.url,
  };
}
