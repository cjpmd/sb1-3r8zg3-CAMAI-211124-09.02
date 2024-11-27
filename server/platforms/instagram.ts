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

export class Instagram {
  static async exchangeToken(code: string) {
    const response = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code,
    });

    // Get user info using the access token
    const { access_token } = response.data;
    const userInfo = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`);

    return {
      access_token,
      username: userInfo.data.username,
      profile_picture: null, // Instagram's Basic Display API doesn't provide profile picture
      expires_in: null, // Instagram tokens don't expire by default
    };
  }

  static async upload(options: UploadOptions) {
    const { file, description, location } = options;

    // Create container
    const containerResponse = await axios.post('https://graph.instagram.com/me/media', {
      image_url: file.buffer.toString('base64'),
      caption: description,
      location_id: location,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
    });

    const { id: containerId } = containerResponse.data;

    // Publish the container
    const publishResponse = await axios.post(`https://graph.instagram.com/me/media_publish`, {
      creation_id: containerId,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
    });

    return {
      postId: publishResponse.data.id,
      postUrl: `https://instagram.com/p/${publishResponse.data.id}`,
    };
  }
}
