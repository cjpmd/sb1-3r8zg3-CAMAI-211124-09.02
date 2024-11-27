import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { exchangeCodeForToken } from '@/lib/tiktokClient';

interface OAuthCallbackProps {
  platform?: string;
}

export function OAuthCallback({ platform: propPlatform }: OAuthCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting OAuth callback handling...');
        
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        console.log('URL Parameters:', { code, state, error, error_description });

        // Get stored values
        const storedState = localStorage.getItem('tiktok_csrf_token');
        const returnUrl = localStorage.getItem('auth_return_url');

        console.log('Stored Values:', { storedState, returnUrl });

        // Clean up stored values
        localStorage.removeItem('tiktok_csrf_token');
        localStorage.removeItem('auth_return_url');

        // Check for errors from OAuth provider
        if (error) {
          console.error('OAuth provider error:', error_description || error);
          throw new Error(error_description || error);
        }

        // Verify state parameter
        if (!state || state !== storedState) {
          console.error('State mismatch:', { state, storedState });
          throw new Error('Invalid state parameter');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Handle TikTok authentication
        if (propPlatform === 'tiktok') {
          console.log('Handling TikTok authentication...');
          const tokenResponse = await exchangeCodeForToken(code);
          console.log('TikTok token response:', tokenResponse);

          if (!tokenResponse.access_token) {
            throw new Error('Failed to get access token from TikTok');
          }

          // Store the connection in Supabase
          const { error: dbError } = await supabase
            .from('connections')
            .upsert({
              platform: 'tiktok',
              access_token: tokenResponse.access_token,
              refresh_token: tokenResponse.refresh_token,
              token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
              platform_user_id: tokenResponse.open_id,
              platform_username: tokenResponse.username,
              status: 'active',
              user_id: (await supabase.auth.getUser()).data.user?.id,
            });

          if (dbError) {
            console.error('Database error:', dbError);
            throw new Error('Failed to save TikTok connection');
          }

          toast({
            title: "Success!",
            description: "Successfully connected to TikTok",
          });
        } else {
          throw new Error('Unsupported platform');
        }

        // Redirect back
        navigate(returnUrl || '/social/connect');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
        navigate('/social/connect');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast, propPlatform]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p>Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold text-destructive">Authentication Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
