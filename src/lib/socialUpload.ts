import { SocialPlatform, UploadOptions, UploadProgress, UploadResult } from '../types/social';

interface UploadHandlers {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (result: UploadResult) => void;
}

export const uploadToSocialPlatform = async (
  file: File,
  platform: SocialPlatform,
  options: UploadOptions,
  handlers?: UploadHandlers
): Promise<UploadResult> => {
  try {
    // Create form data with file and metadata
    const formData = new FormData();
    formData.append('file', file);
    formData.append('platform', platform);
    
    if (options.title) formData.append('title', options.title);
    if (options.description) formData.append('description', options.description);
    if (options.thumbnail) formData.append('thumbnail', options.thumbnail);
    if (options.scheduledTime) formData.append('scheduledTime', options.scheduledTime.toISOString());
    if (options.tags) formData.append('tags', JSON.stringify(options.tags));
    if (options.location) formData.append('location', options.location);
    if (options.visibility) formData.append('visibility', options.visibility);

    // Upload to your backend which handles the social media API calls
    const response = await fetch('/api/social/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progressEvent) => {
        if (handlers?.onProgress) {
          handlers.onProgress({
            platform,
            progress: (progressEvent.loaded / progressEvent.total) * 100,
            status: 'uploading'
          });
        }
      }
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();

    if (handlers?.onComplete) {
      handlers.onComplete({
        platform,
        success: true,
        postId: result.postId,
        postUrl: result.postUrl
      });
    }

    return {
      platform,
      success: true,
      postId: result.postId,
      postUrl: result.postUrl
    };
  } catch (error) {
    const errorResult = {
      platform,
      success: false,
      error: error.message
    };

    if (handlers?.onComplete) {
      handlers.onComplete(errorResult);
    }

    return errorResult;
  }
};

export const uploadToMultiplePlatforms = async (
  file: File,
  options: UploadOptions,
  handlers?: UploadHandlers
): Promise<UploadResult[]> => {
  const uploadPromises = options.platforms.map(platform =>
    uploadToSocialPlatform(file, platform, options, handlers)
  );

  return Promise.all(uploadPromises);
};
