import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { updateUserTokens } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error('No code provided');
    }

    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Get the current user
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const userId = session.user.id;
    let tokens;

    // Exchange code for tokens based on platform
    switch (params.platform) {
      case 'instagram':
        tokens = await exchangeInstagramCode(code);
        break;
      case 'facebook':
        tokens = await exchangeFacebookCode(code);
        break;
      case 'youtube':
        tokens = await exchangeYouTubeCode(code);
        break;
      case 'tiktok':
        tokens = await exchangeTikTokCode(code);
        break;
      case 'x':
        tokens = await exchangeXCode(code);
        break;
      default:
        throw new Error('Invalid platform');
    }

    // Update user's tokens in the database
    await updateUserTokens(userId, params.platform as any, tokens);

    // Clear OAuth state
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('platform');

    // Redirect back to the app
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/error?message=Failed to connect account', request.url)
    );
  }
}

async function exchangeInstagramCode(code: string) {
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Instagram code');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    userId: data.user_id,
  };
}

async function exchangeFacebookCode(code: string) {
  const response = await fetch(
    `https://graph.facebook.com/v12.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      code,
    })
  );

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook code');
  }

  const data = await response.json();

  // Get user's pages
  const pagesResponse = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${data.access_token}`
  );
  const pages = await pagesResponse.json();
  const page = pages.data[0]; // Use first page

  return {
    accessToken: page.access_token,
    pageId: page.id,
  };
}

async function exchangeYouTubeCode(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange YouTube code');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID!,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
  };
}

async function exchangeTikTokCode(code: string) {
  const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange TikTok code');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    userId: data.open_id,
  };
}

async function exchangeXCode(code: string) {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      code_verifier: 'challenge',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange X code');
  }

  const data = await response.json();
  
  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });
  
  const userData = await userResponse.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userId: userData.data.id,
  };
}
