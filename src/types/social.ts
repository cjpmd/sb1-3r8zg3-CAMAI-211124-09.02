export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  profilePicture?: string;
}

export interface UploadOptions {
  title?: string;
  description?: string;
  thumbnail?: File;
  platforms: SocialPlatform[];
  scheduledTime?: Date;
  tags?: string[];
  location?: string;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface UploadProgress {
  platform: SocialPlatform;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface UploadResult {
  platform: SocialPlatform;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}
