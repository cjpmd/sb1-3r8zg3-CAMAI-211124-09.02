import axios from 'axios';
import FormData from 'form-data';

interface UploadOptions {
  file: Express.Multer.File;
  thumbnail?: Express.Multer.File;
  title?: string;
  description?: string;
  tags?: string[];
  location?: string;
  scheduledTime?: string;
  visibility?: string;
}

export class Facebook {
  static async exchangeToken(code: string) {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    });

    const { access_token } = response.data;

    // Get user info
    const userInfo = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,picture',
        access_token,
      },
    });

    return {
      access_token,
      username: userInfo.data.name,
      profile_picture: userInfo.data.picture?.data?.url,
      expires_in: response.data.expires_in,
    };
  }

  static async upload(options: UploadOptions) {
    const {
      file,
      description,
      title,
      scheduledTime,
      visibility,
      location,
    } = options;

    // Initialize upload session
    const initResponse = await axios.post(
      'https://graph.facebook.com/v18.0/me/videos',
      {
        upload_phase: 'start',
        access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      }
    );

    const { upload_session_id, video_id } = initResponse.data;

    // Upload video chunks
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.buffer.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.buffer.length);
      const chunk = file.buffer.slice(start, end);

      const formData = new FormData();
      formData.append('video_file_chunk', chunk, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('upload_phase', 'transfer');
      formData.append('upload_session_id', upload_session_id);
      formData.append('start_offset', start.toString());

      await axios.post('https://graph.facebook.com/v18.0/me/videos', formData, {
        headers: formData.getHeaders(),
        params: {
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
        },
      });
    }

    // Finish upload
    await axios.post(
      'https://graph.facebook.com/v18.0/me/videos',
      {
        upload_phase: 'finish',
        upload_session_id,
        title,
        description,
        published: visibility !== 'private',
        scheduled_publish_time: scheduledTime
          ? Math.floor(new Date(scheduledTime).getTime() / 1000)
          : undefined,
        place_id: location,
        access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      }
    );

    return {
      postId: video_id,
      postUrl: `https://facebook.com/${video_id}`,
    };
  }
}
