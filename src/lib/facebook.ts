import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk';
import { getUserTokens } from './auth';

export async function initFacebookApi(userId: string) {
  const userTokens = await getUserTokens(userId);
  
  if (!userTokens.facebook) {
    throw new Error('User has not connected their Facebook account');
  }

  const { accessToken } = userTokens.facebook;
  FacebookAdsApi.init(accessToken);
  return FacebookAdsApi.getDefaultApi();
}

export async function uploadToFacebook(
  userId: string,
  file: Blob,
  metadata: { title: string; description: string }
) {
  const userTokens = await getUserTokens(userId);
  
  if (!userTokens.facebook) {
    throw new Error('User has not connected their Facebook account');
  }

  const { accessToken, pageId } = userTokens.facebook;
  const buffer = await file.arrayBuffer();
  const formData = new FormData();
  formData.append('source', new Blob([buffer]));
  formData.append('description', `${metadata.title}\n\n${metadata.description}`);

  const response = await fetch(
    `https://graph.facebook.com/${pageId}/videos`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Facebook');
  }

  return await response.json();
}
