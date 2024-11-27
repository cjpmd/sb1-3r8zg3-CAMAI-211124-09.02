import { google } from 'googleapis';
import { Readable } from 'stream';

interface UploadOptions {
  file: Express.Multer.File;
  thumbnail?: Express.Multer.File;
  title?: string;
  description?: string;
  tags?: string[];
  scheduledTime?: string;
  visibility?: string;
}

export class YouTube {
  private static getClient() {
    return new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
  }

  static async exchangeToken(code: string) {
    const oauth2Client = this.getClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube('v3');
    const response = await youtube.channels.list({
      auth: oauth2Client,
      part: ['snippet'],
      mine: true,
    });

    const channel = response.data.items?.[0];

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      username: channel?.snippet?.title || '',
      profile_picture: channel?.snippet?.thumbnails?.default?.url,
      expires_in: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : null,
    };
  }

  static async upload(options: UploadOptions) {
    const {
      file,
      thumbnail,
      title,
      description,
      tags,
      scheduledTime,
      visibility,
    } = options;

    const oauth2Client = this.getClient();
    const youtube = google.youtube('v3');

    // Create readable stream from buffer
    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);

    // Upload video
    const uploadResponse = await youtube.videos.insert({
      auth: oauth2Client,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
        },
        status: {
          privacyStatus: visibility || 'private',
          publishAt: scheduledTime,
        },
      },
      media: {
        body: fileStream,
      },
    });

    const videoId = uploadResponse.data.id;

    // Upload thumbnail if provided
    if (thumbnail && videoId) {
      const thumbnailStream = new Readable();
      thumbnailStream.push(thumbnail.buffer);
      thumbnailStream.push(null);

      await youtube.thumbnails.set({
        auth: oauth2Client,
        videoId,
        media: {
          body: thumbnailStream,
        },
      });
    }

    return {
      postId: videoId,
      postUrl: `https://youtube.com/watch?v=${videoId}`,
    };
  }
}
