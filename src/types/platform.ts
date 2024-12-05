export type Platform = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'custom';

export type PlatformConfig = {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
};

export type PlatformConnection = {
  id: string;
  platform: Platform;
  username: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  profilePicture: string | null;
  connected: boolean;
  name?: string;
};

export type PlatformCredentials = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: string;
  pageId?: string;
};
