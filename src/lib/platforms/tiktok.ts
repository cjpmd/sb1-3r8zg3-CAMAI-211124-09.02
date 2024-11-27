import { Platform, PlatformPostResult, PlatformConfig } from './index';
import { Content } from '@/types/supabase';

const TIKTOK_MAX_TITLE_LENGTH = 100;
const TIKTOK_MAX_DESCRIPTION_LENGTH = 2200;
const TIKTOK_MAX_MEDIA_COUNT = 1;
const TIKTOK_SUPPORTED_MEDIA_TYPES = [
  'video/mp4',
  'video/quicktime',
];

export const TikTokPlatform: Platform = {
  name: 'tiktok',

  async postContent(content: Content, config: PlatformConfig): Promise<PlatformPostResult> {
    try {
      // TODO: Implement actual TikTok API integration
      // This is a placeholder implementation
      console.log('Posting to TikTok:', {
        content,
        config,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        postId: `tt_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to post to TikTok',
      };
    }
  },

  async validateContent(content: Content) {
    const errors: string[] = [];

    // Validate title length
    if (content.title.length > TIKTOK_MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${TIKTOK_MAX_TITLE_LENGTH} characters or less`);
    }

    // Validate description length
    if (content.description.length > TIKTOK_MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be ${TIKTOK_MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    // Validate media count
    if (content.media_urls.length === 0) {
      errors.push('A video file is required');
    }
    if (content.media_urls.length > TIKTOK_MAX_MEDIA_COUNT) {
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
      maxTitleLength: TIKTOK_MAX_TITLE_LENGTH,
      maxDescriptionLength: TIKTOK_MAX_DESCRIPTION_LENGTH,
      supportedMediaTypes: TIKTOK_SUPPORTED_MEDIA_TYPES,
      maxMediaCount: TIKTOK_MAX_MEDIA_COUNT,
    };
  },
};
