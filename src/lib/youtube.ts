import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getUserTokens } from './auth';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

export async function getYouTubeClient(userId: string) {
  const userTokens = await getUserTokens(userId);
  
  if (!userTokens.youtube) {
    throw new Error('User has not connected their YouTube account');
  }

  const { clientId, clientSecret, accessToken, refreshToken } = userTokens.youtube;

  const oAuth2Client = new OAuth2Client(
    clientId,
    clientSecret,
    process.env.VITE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.youtube({ version: 'v3', auth: oAuth2Client });
}

export async function uploadToYouTube(
  userId: string,
  file: Blob,
  metadata: { title: string; description: string }
) {
  const youtube = await getYouTubeClient(userId);
  const buffer = await file.arrayBuffer();

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: ['Uploaded from my app'],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: 'private', // Start as private for safety
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: Buffer.from(buffer),
    },
  });

  return response.data;
}
