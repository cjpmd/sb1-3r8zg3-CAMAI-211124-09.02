import axios from 'axios';
import FormData from 'form-data';

interface UploadOptions {
  file: Express.Multer.File;
  title?: string;
  description?: string;
  tags?: string[];
  scheduledTime?: string;
  visibility?: string;
}

export class TikTok {
  static async exchangeToken(code: string) {
    const response = await axios.post('https://open-api.tiktok.com/oauth/access_token/', {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const { access_token, open_id, expires_in } = response.data.data;

    // Get user info
    const userInfo = await axios.get('https://open-api.tiktok.com/user/info/', {
      params: {
        access_token,
        open_id,
        fields: ['display_name', 'avatar_url'],
      },
    });

    return {
      access_token,
      refresh_token: response.data.data.refresh_token,
      username: userInfo.data.data.user.display_name,
      profile_picture: userInfo.data.data.user.avatar_url,
      expires_in,
    };
  }

  static async upload(options: UploadOptions) {
    const { file, description, tags } = options;

    // Initialize upload
    const initResponse = await axios.post('https://open-api.tiktok.com/share/video/upload/', {
      source: 'FILE',
      access_token: process.env.TIKTOK_ACCESS_TOKEN,
    });

    const { upload_url } = initResponse.data.data;

    // Upload video
    const formData = new FormData();
    formData.append('video', file.buffer, file.originalname);

    const uploadResponse = await axios.post(upload_url, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    // Publish video
    const publishResponse = await axios.post('https://open-api.tiktok.com/share/video/publish/', {
      access_token: process.env.TIKTOK_ACCESS_TOKEN,
      video_id: uploadResponse.data.data.video_id,
      title: description,
      privacy_level: options.visibility === 'private' ? 'SELF_ONLY' : 'PUBLIC',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    });

    return {
      postId: publishResponse.data.data.share_id,
      postUrl: `https://www.tiktok.com/@${publishResponse.data.data.video_id}`,
    };
  }
}
