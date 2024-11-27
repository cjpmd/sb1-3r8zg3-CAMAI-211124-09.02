import { Platform, PlatformPostResult, PlatformConfig } from './index';
import { Content } from '@/types/supabase';

const TWITTER_MAX_TITLE_LENGTH = 280; // Twitter's character limit
const TWITTER_MAX_DESCRIPTION_LENGTH = 0; // Twitter doesn't have a separate description
const TWITTER_MAX_MEDIA_COUNT = 4;
const TWITTER_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
];

export const TwitterPlatform: Platform = {
  name: 'twitter',

  async postContent(content: Content, config: PlatformConfig): Promise<PlatformPostResult> {
    try {
      // TODO: Implement actual Twitter API integration
      // This is a placeholder implementation
      console.log('Posting to Twitter:', {
        content,
        config,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        postId: `tw_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to post to Twitter',
      };
    }
  },

  async validateContent(content: Content) {
    const errors: string[] = [];

    // For Twitter, we combine title and description since it's just one tweet
    const totalLength = content.title.length + (content.description ? content.description.length + 1 : 0);
    if (totalLength > TWITTER_MAX_TITLE_LENGTH) {
      errors.push(`Tweet must be ${TWITTER_MAX_TITLE_LENGTH} characters or less`);
    }

    // Validate media count
    if (content.media_urls.length > TWITTER_MAX_MEDIA_COUNT) {
      errors.push(`Maximum ${TWITTER_MAX_MEDIA_COUNT} media files allowed`);
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
      maxTitleLength: TWITTER_MAX_TITLE_LENGTH,
      maxDescriptionLength: TWITTER_MAX_DESCRIPTION_LENGTH,
      supportedMediaTypes: TWITTER_SUPPORTED_MEDIA_TYPES,
      maxMediaCount: TWITTER_MAX_MEDIA_COUNT,
    };
  },
};
