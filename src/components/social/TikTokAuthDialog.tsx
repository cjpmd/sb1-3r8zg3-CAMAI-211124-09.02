import React, { useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface TikTokAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function TikTokAuthDialog({ isOpen, onClose, onSuccess, onError }: TikTokAuthDialogProps) {
  const { toast } = useToast();
  const [authWindow, setAuthWindow] = React.useState<Window | null>(null);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const getTikTokAuthUrl = () => {
    const clientId = import.meta.env.VITE_TIKTOK_CLIENT_ID;
    
    if (!clientId) {
      toast({
        title: "TikTok Configuration Error",
        description: (
          <div className="space-y-2">
            <p>TikTok client ID is not configured. Please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <a href="https://developers.tiktok.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">TikTok for Developers</a></li>
              <li>Create a new app</li>
              <li>Add Login Kit capability</li>
              <li>Configure redirect URL: {window.location.origin}/auth/callback</li>
              <li>Copy the Client Key to your .env file as VITE_TIKTOK_CLIENT_ID</li>
            </ol>
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      return '';
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = Math.random().toString(36).substring(2, 8);
    const returnTo = `${window.location.pathname}${window.location.search}`;
    
    // Store platform info for the callback
    window.localStorage.setItem('auth_platform', 'tiktok');
    window.localStorage.setItem('auth_state', state);
    window.localStorage.setItem('auth_return_to', returnTo);
    
    const authUrl = `https://www.tiktok.com/auth/authorize?` +
      `client_key=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=user.info.basic,video.list&` +
      `response_type=code&` +
      `state=${state}`;

    return authUrl;
  };

  const startAuth = () => {
    const authUrl = getTikTokAuthUrl();
    if (!authUrl) return;

    if (isMobileDevice()) {
      // For mobile devices, do a full page redirect
      window.location.href = authUrl;
    } else {
      // For desktop, try popup first with redirect fallback
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const newWindow = window.open(
        authUrl,
        'TikTok Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (newWindow) {
        setAuthWindow(newWindow);
      } else {
        // If popup blocked, fallback to redirect
        window.location.href = authUrl;
      }
    }
  };

  // Handle message from popup (desktop only)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'AUTH_SUCCESS') {
        if (authWindow) {
          authWindow.close();
        }
        onClose();
        onSuccess?.();
      } else if (event.data.type === 'AUTH_ERROR') {
        if (authWindow) {
          authWindow.close();
        }
        toast({
          title: "Error",
          description: event.data.error || "Authentication failed. Please try again.",
          variant: "destructive",
        });
        onError?.(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authWindow, onSuccess, onError, toast, onClose]);

  // Check if popup is closed (desktop only)
  useEffect(() => {
    if (!authWindow) return;

    const checkWindow = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindow);
        setAuthWindow(null);
      }
    }, 500);

    return () => clearInterval(checkWindow);
  }, [authWindow]);

  // Start auth flow when dialog opens
  useEffect(() => {
    if (isOpen) {
      startAuth();
    }
  }, [isOpen]);

  // Don't show the loading state on mobile since we're doing a full redirect
  if (isMobileDevice()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold tracking-tight">Connecting to TikTok</h2>
            <p className="text-sm text-muted-foreground">
              Please complete the authentication in the popup window. If you don't see it, check if it was blocked by your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
