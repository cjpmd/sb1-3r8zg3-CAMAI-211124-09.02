import { useEffect } from 'react';
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useToast } from "~/components/ui/use-toast";
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const router = useRouter();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { code, error, error_description } = router.query;

  const instagramCallback = api.auth.handleInstagramCallback.useMutation({
    onSuccess: () => {
      toast({
        title: "Successfully connected Instagram!",
        description: "You can now post and manage your Instagram content.",
      });
      // Redirect back to the connect accounts page
      const redirect = sessionStorage.getItem("oauth_redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/connect-accounts");
      }
    },
    onError: (error) => {
      console.error("Instagram connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      router.push("/connect-accounts");
    },
  });

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const isPopup = window.opener !== null;

      // Log all parameters for debugging
      console.log('Auth Callback Parameters:', {
        code,
        state,
        error,
        errorDescription,
        isPopup,
        origin: window.location.origin,
        href: window.location.href
      });

      if (error || !code) {
        console.error('Auth error:', error, errorDescription);
        if (isPopup) {
          window.opener.postMessage(
            { 
              type: 'AUTH_ERROR', 
              error: errorDescription || error || 'No authorization code received'
            },
            window.location.origin
          );
          window.close();
        } else {
          navigate('/auth/error');
        }
        return;
      }

      // Handle YouTube auth
      const storedYouTubeState = sessionStorage.getItem('youtube_state');
      console.log('YouTube State Check:', { storedYouTubeState, receivedState: state });
      
      if (storedYouTubeState && state === storedYouTubeState && isPopup) {
        console.log('YouTube auth success, sending code back');
        sessionStorage.removeItem('youtube_state');
        
        window.opener.postMessage(
          { type: 'YOUTUBE_AUTH_SUCCESS', code },
          window.location.origin
        );
        window.close();
        return;
      }

      // Handle TikTok auth
      const storedTikTokState = sessionStorage.getItem('tiktok_state');
      if (storedTikTokState && state === storedTikTokState && isPopup) {
        sessionStorage.removeItem('tiktok_state');
        
        window.opener.postMessage(
          { type: 'TIKTOK_AUTH_SUCCESS', code },
          window.location.origin
        );
        window.close();
        return;
      }

      // Handle Instagram auth
      if (code) {
        instagramCallback.mutate({ code: code as string });
      }

      // Handle other platforms
      try {
        const redirectUrl = sessionStorage.getItem('oauth_redirect');
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/connect');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/auth/error');
      }
    };

    handleCallback();
  }, [navigate, searchParams, instagramCallback]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-bold">
          Completing Authentication...
        </h1>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </main>
  );
}
