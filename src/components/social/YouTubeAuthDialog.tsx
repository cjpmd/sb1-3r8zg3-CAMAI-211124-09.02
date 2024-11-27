import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface YouTubeAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function YouTubeAuthDialog({ isOpen, onClose, onSuccess, onError }: YouTubeAuthDialogProps) {
  const { toast } = useToast();

  const getYouTubeAuthUrl = () => {
    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
    
    if (!clientId) {
      toast({
        title: "YouTube Configuration Error",
        description: (
          <div className="space-y-2">
            <p>YouTube client ID is not configured. Please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <a href="https://console.cloud.google.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li>Enable the YouTube Data API</li>
              <li>Configure OAuth consent screen</li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Add redirect URL: {window.location.origin}/auth/callback</li>
              <li>Copy the Client ID to your .env file as VITE_YOUTUBE_CLIENT_ID</li>
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
    
    // Store platform info for the callback
    window.localStorage.setItem('auth_platform', 'youtube');
    window.localStorage.setItem('auth_state', state);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=https://www.googleapis.com/auth/youtube.readonly&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${state}`;

    return authUrl;
  };

  // Handle message from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'AUTH_SUCCESS') {
        onClose();
        onSuccess?.();
      } else if (event.data.type === 'AUTH_ERROR') {
        toast({
          title: "Error",
          description: "Authentication failed. Please try again.",
          variant: "destructive",
        });
        onError?.(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError, toast, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <img src="/youtube-icon.svg" alt="YouTube" className="w-5 h-5 mr-2" />
          Connect YouTube
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>Connect YouTube Account</DialogTitle>
          <DialogDescription>
            Sign in with your YouTube account to enable content management and analytics
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-[700px] overflow-hidden">
          <iframe
            src={getYouTubeAuthUrl()}
            className="w-full h-full border-none"
            title="YouTube Authentication"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
