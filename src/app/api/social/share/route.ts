import { NextResponse } from 'next/server';
import { uploadToYouTube } from '@/lib/youtube';
import { uploadToFacebook } from '@/lib/facebook';
import { getUserTokens } from '@/lib/auth';
import { auth } from '@/lib/auth/config';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'photo' | 'video';
    const platforms = JSON.parse(formData.get('platforms') as string);

    const uploadTasks = [];
    const results: Record<string, any> = {};

    // Get user's social media tokens
    const userTokens = await getUserTokens(userId);

    if (platforms.instagram && userTokens.instagram) {
      uploadTasks.push(
        shareToInstagram(userId, file, { title, description })
          .then(result => results.instagram = result)
          .catch(error => {
            console.error('Instagram upload failed:', error);
            results.instagram = { error: error.message };
          })
      );
    }

    if (platforms.tiktok && userTokens.tiktok) {
      uploadTasks.push(
        shareToTikTok(userId, file, { title, description })
          .then(result => results.tiktok = result)
          .catch(error => {
            console.error('TikTok upload failed:', error);
            results.tiktok = { error: error.message };
          })
      );
    }

    if (platforms.youtube && type === 'video' && userTokens.youtube) {
      uploadTasks.push(
        uploadToYouTube(userId, file, { title, description })
          .then(result => results.youtube = result)
          .catch(error => {
            console.error('YouTube upload failed:', error);
            results.youtube = { error: error.message };
          })
      );
    }

    if (platforms.facebook && userTokens.facebook) {
      uploadTasks.push(
        uploadToFacebook(userId, file, { title, description })
          .then(result => results.facebook = result)
          .catch(error => {
            console.error('Facebook upload failed:', error);
            results.facebook = { error: error.message };
          })
      );
    }

    await Promise.all(uploadTasks);

    return NextResponse.json({ 
      success: true,
      results
    });
  } catch (error) {
    console.error('Error sharing media:', error);
    return NextResponse.json(
      { error: 'Failed to share media' },
      { status: 500 }
    );
  }
}

async function shareToInstagram(
  userId: string,
  file: Blob,
  metadata: { title: string; description: string }
) {
  const userTokens = await getUserTokens(userId);
  if (!userTokens.instagram) {
    throw new Error('User has not connected their Instagram account');
  }

  const { accessToken } = userTokens.instagram;
  
  const formData = new FormData();
  formData.append('image_url', URL.createObjectURL(file));
  formData.append('caption', `${metadata.title}\n\n${metadata.description}`);

  const response = await fetch(
    `https://graph.instagram.com/me/media`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Instagram');
  }

  return await response.json();
}

async function shareToTikTok(
  userId: string,
  file: Blob,
  metadata: { title: string; description: string }
) {
  const userTokens = await getUserTokens(userId);
  if (!userTokens.tiktok) {
    throw new Error('User has not connected their TikTok account');
  }

  const { accessToken } = userTokens.tiktok;

  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', metadata.title);
  formData.append('description', metadata.description);

  const response = await fetch(
    'https://open-api.tiktok.com/share/video/upload/',
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to TikTok');
  }

  return await response.json();
}
