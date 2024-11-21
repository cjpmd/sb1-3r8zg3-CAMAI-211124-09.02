export interface SocialAccount {
  platform: string;
  connected: boolean;
  username?: string;
}

export const connectSocialAccount = async (platform: string): Promise<void> => {
  switch (platform) {
    case 'tiktok':
      window.location.href = `https://www.tiktok.com/auth/authorize?client_key=${
        import.meta.env.VITE_TIKTOK_CLIENT_KEY
      }&scope=video.upload&response_type=code&redirect_uri=${
        import.meta.env.VITE_REDIRECT_URI
      }`;
      break;
    case 'instagram':
      window.location.href = `https://api.instagram.com/oauth/authorize?client_id=${
        import.meta.env.VITE_INSTAGRAM_CLIENT_ID
      }&redirect_uri=${
        import.meta.env.VITE_REDIRECT_URI
      }&scope=user_profile,user_media&response_type=code`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export const uploadToSocial = async (
  platform: string,
  videoBlob: Blob,
  caption: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('video', videoBlob);
  formData.append('caption', caption);

  // This would be replaced with actual API endpoints
  const response = await fetch(`/api/upload/${platform}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to ${platform}`);
  }

  const { url } = await response.json();
  return url;
};