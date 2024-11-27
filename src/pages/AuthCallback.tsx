import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const returnedState = params.get('state');
      const platform = window.localStorage.getItem('auth_platform');
      const savedState = window.localStorage.getItem('auth_state');
      const returnTo = window.localStorage.getItem('auth_return_to');

      const handleError = (error: string) => {
        setStatus('error');
        const isPopup = window.opener !== null;
        
        if (isPopup) {
          window.opener?.postMessage({ type: 'AUTH_ERROR', error }, window.location.origin);
          window.close();
        } else {
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
          navigate(returnTo || '/connect');
        }
      };

      const handleSuccess = () => {
        setStatus('success');
        const isPopup = window.opener !== null;
        
        if (isPopup) {
          window.opener?.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
          window.close();
        } else {
          toast({
            title: 'Success',
            description: 'Account connected successfully!',
          });
          navigate(returnTo || '/connect');
        }
      };

      if (!code || !platform) {
        handleError('No authorization code or platform information received');
        return;
      }

      // Verify state to prevent CSRF attacks
      if (returnedState !== savedState) {
        handleError('Invalid state parameter');
        return;
      }

      try {
        let response;
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        if (platform === 'tiktok') {
          response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_key: import.meta.env.VITE_TIKTOK_CLIENT_ID,
              client_secret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET,
              code,
              grant_type: 'authorization_code',
            }),
          });

          const tokenData = await response.json();

          if (!response.ok || tokenData.error) {
            throw new Error(tokenData.error_description || 'Failed to get access token');
          }

          // Get user info
          const userResponse = await fetch('https://open-api.tiktok.com/oauth/userinfo/', {
            headers: {
              'Authorization': `Bearer ${tokenData.data.access_token}`,
            },
          });

          const userData = await userResponse.json();

          if (!userResponse.ok || userData.error) {
            throw new Error(userData.error_description || 'Failed to get user info');
          }

          // Store in Supabase
          const { error: dbError } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: user.id,
              platform: 'tiktok',
              platform_user_id: userData.data.open_id,
              access_token: tokenData.data.access_token,
              refresh_token: tokenData.data.refresh_token,
              expires_at: new Date(Date.now() + tokenData.data.expires_in * 1000).toISOString(),
              profile_data: userData.data,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,platform',
            });

          if (dbError) throw dbError;
        }

        // Clear auth state
        window.localStorage.removeItem('auth_platform');
        window.localStorage.removeItem('auth_state');
        window.localStorage.removeItem('auth_return_to');

        handleSuccess();
      } catch (error: any) {
        console.error('Auth callback error:', error);
        handleError(error.message || 'Failed to authenticate');
      }
    }

    handleCallback();
  }, [location.search, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {status === 'loading' ? 'Connecting your account...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
