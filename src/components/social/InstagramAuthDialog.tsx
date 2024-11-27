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

interface InstagramAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function InstagramAuthDialog({ isOpen, onClose, onSuccess, onError }: InstagramAuthDialogProps) {
  const { toast } = useToast();

  const getInstagramAuthUrl = () => {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    
    if (!clientId) {
      toast({
        title: "Instagram Configuration Error",
        description: (
          <div className="space-y-2">
            <p>Instagram client ID is not configured. Please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <a href="https://developers.facebook.com" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Meta for Developers</a></li>
              <li>Create a new app or select an existing one</li>
              <li>Add Instagram Basic Display product</li>
              <li>Configure OAuth Redirect URI: {window.location.origin}/auth/callback</li>
              <li>Copy the Instagram App ID to your .env file as VITE_INSTAGRAM_CLIENT_ID</li>
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
    window.localStorage.setItem('auth_platform', 'instagram');
    window.localStorage.setItem('auth_state', state);
    
    const authUrl = `https://api.instagram.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=user_profile,user_media&` +
      `response_type=code&` +
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
      <DialogContent className="max-w-[800px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>Connect Instagram Account</DialogTitle>
          <DialogDescription>
            Sign in with your Instagram account to enable content management and analytics
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-[700px] overflow-hidden">
          <iframe
            src={getInstagramAuthUrl()}
            className="w-full h-full border-none"
            title="Instagram Authentication"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
