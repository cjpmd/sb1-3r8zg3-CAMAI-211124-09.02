import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function TikTokCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const storedState = localStorage.getItem('tiktok_csrf_token');
      const isPopup = window.opener !== null;

      // Verify CSRF token
      if (!state || state !== storedState) {
        console.error('Invalid state parameter');
        if (isPopup) {
          window.close();
        } else {
          navigate('/auth/error?provider=tiktok');
        }
        return;
      }

      if (!code) {
        console.error('No code parameter');
        if (isPopup) {
          window.close();
        } else {
          navigate('/auth/error?provider=tiktok');
        }
        return;
      }

      try {
        if (isPopup) {
          // Send message to parent window
          window.opener.postMessage(
            { type: 'TIKTOK_AUTH_SUCCESS', code },
            window.location.origin
          );
          window.close();
        } else {
          // Exchange code for access token using your backend API
          const response = await fetch('/api/auth/tiktok/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange code for token');
          }

          const data = await response.json();
          
          // Store the user data
          localStorage.setItem('userId', data.userId);
          
          // Redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error during TikTok authentication:', error);
        if (isPopup) {
          window.opener.postMessage(
            { type: 'TIKTOK_AUTH_ERROR', error: error.message },
            window.location.origin
          );
          window.close();
        } else {
          navigate('/auth/error?provider=tiktok');
        }
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-bold">
          Completing TikTok Login...
        </h1>
        <p>Please wait while we authenticate you.</p>
      </div>
    </main>
  );
}
