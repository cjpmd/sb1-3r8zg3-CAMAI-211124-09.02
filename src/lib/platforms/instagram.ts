import { Platform, PlatformPostResult, PlatformConfig } from './index';
import { Content } from '@/types/supabase';

const INSTAGRAM_MAX_TITLE_LENGTH = 75;
const INSTAGRAM_MAX_DESCRIPTION_LENGTH = 2200;
const INSTAGRAM_MAX_MEDIA_COUNT = 10;
const INSTAGRAM_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'video/mp4',
  'video/quicktime',
];

export const InstagramPlatform: Platform = {
  name: 'instagram',

  async postContent(content: Content, config: PlatformConfig): Promise<PlatformPostResult> {
    try {
      // TODO: Implement actual Instagram API integration
      // This is a placeholder implementation
      console.log('Posting to Instagram:', {
        content,
        config,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        postId: `ig_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to post to Instagram',
      };
    }
  },

  async validateContent(content: Content) {
    const errors: string[] = [];

    // Validate title length
    if (content.title.length > INSTAGRAM_MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${INSTAGRAM_MAX_TITLE_LENGTH} characters or less`);
    }

    // Validate description length
    if (content.description.length > INSTAGRAM_MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be ${INSTAGRAM_MAX_DESCRIPTION_LENGTH} characters or less`);
    }

    // Validate media count
    if (content.media_urls.length === 0) {
      errors.push('At least one media file is required');
    }
    if (content.media_urls.length > INSTAGRAM_MAX_MEDIA_COUNT) {
      errors.push(`Maximum ${INSTAGRAM_MAX_MEDIA_COUNT} media files allowed`);
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
      maxTitleLength: INSTAGRAM_MAX_TITLE_LENGTH,
      maxDescriptionLength: INSTAGRAM_MAX_DESCRIPTION_LENGTH,
      supportedMediaTypes: INSTAGRAM_SUPPORTED_MEDIA_TYPES,
      maxMediaCount: INSTAGRAM_MAX_MEDIA_COUNT,
    };
  },
};
