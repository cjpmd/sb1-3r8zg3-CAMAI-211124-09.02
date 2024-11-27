import { Platform, PlatformPostResult, PlatformConfig } from './index';
import { Content } from '@/types/supabase';

const YOUTUBE_MAX_TITLE_LENGTH = 100;
const YOUTUBE_MAX_DESCRIPTION_LENGTH = 5000;
const YOUTUBE_MAX_MEDIA_COUNT = 1;
const YOUTUBE_SUPPORTED_MEDIA_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/avi',
];

export const YouTubePlatform: Platform = {
  name: 'youtube',

  async postContent(content: Content, config: PlatformConfig): Promise<PlatformPostResult> {
    try {
      // TODO: Implement actual YouTube API integration
      // This is a placeholder implementation
      console.log('Posting to YouTube:', {
        content,
        config,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        postId: `yt_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to post to YouTube',
      };
    }
  },

  async validateContent(content: Content) {
    const errors: string[] = [];

    // Validate title length
    if (content.title.length > YOUTUBE_MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${YOUTUBE_MAX_TITLE_LENGTH} characters or less`);
    }

    // Validate description length
    if (content.description.length > YOUTUBE_MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be ${YOUTUBE_MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    // Validate media count
    if (content.media_urls.length === 0) {
      errors.push('A video file is required');
    }
    if (content.media_urls.length > YOUTUBE_MAX_MEDIA_COUNT) {
      errors.push('Only one video file is allowed');
    }

    // TODO: Validate media types when we have access to file metadata
    // Currently we only have URLs, so we can't check file types

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  getRequirements() {
    return {
      maxTitleLength: YOUTUBE_MAX_TITLE_LENGTH,
      maxDescriptionLength: YOUTUBE_MAX_DESCRIPTION_LENGTH,
      supportedMediaTypes: YOUTUBE_SUPPORTED_MEDIA_TYPES,
      maxMediaCount: YOUTUBE_MAX_MEDIA_COUNT,
    };
  },
};
