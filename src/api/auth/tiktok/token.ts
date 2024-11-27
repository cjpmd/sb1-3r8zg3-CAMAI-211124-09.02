import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const tiktokClientId = process.env.VITE_TIKTOK_CLIENT_ID;
const tiktokClientSecret = process.env.VITE_TIKTOK_CLIENT_SECRET;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: tiktokClientId!,
        client_secret: tiktokClientSecret!,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`TikTok API error: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://open-api.tiktok.com/oauth/userinfo/', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    // Store the tokens and user info in Supabase
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: req.user?.id, // You'll need to get the user ID from the session
        platform: 'tiktok',
        platform_user_id: userData.open_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        profile_data: userData,
      });

    if (dbError) {
      throw dbError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('TikTok auth error:', error);
    return res.status(500).json({ error: 'Failed to authenticate with TikTok' });
  }
}
