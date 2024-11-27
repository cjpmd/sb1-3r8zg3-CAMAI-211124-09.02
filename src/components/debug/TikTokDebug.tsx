import { useEffect } from 'react';
import { TIKTOK_CLIENT_KEY, TIKTOK_REDIRECT_URI } from '@/lib/tiktokClient';

export function TikTokDebug() {
  useEffect(() => {
    console.log('TikTok Debug Information:', {
      clientKeyExists: !!TIKTOK_CLIENT_KEY,
      clientKeyLength: TIKTOK_CLIENT_KEY?.length || 0,
      redirectUri: TIKTOK_REDIRECT_URI,
      allEnvVars: import.meta.env
    });
  }, []);

  // Only render in development
  if (import.meta.env.DEV) {
    return (
      <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
        <div>Debug Info:</div>
        <div>Client Key: {TIKTOK_CLIENT_KEY ? '✅' : '❌'}</div>
        <div>Redirect URI: {TIKTOK_REDIRECT_URI}</div>
      </div>
    );
  }

  return null;
}
