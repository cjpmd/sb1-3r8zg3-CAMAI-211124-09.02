import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface XAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function XAuthDialog({ isOpen, onClose, onSuccess, onError }: XAuthDialogProps) {
  const { toast } = useToast();

  const getXAuthUrl = useCallback(() => {
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID;
    
    if (!clientId) {
      return null;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = Math.random().toString(36).substring(2, 8);
    const codeChallenge = Math.random().toString(36).substring(7);
    
    // Store platform info for the callback
    window.localStorage.setItem('auth_platform', 'x');
    window.localStorage.setItem('auth_state', state);
    
    return `https://twitter.com/i/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=tweet.read tweet.write users.read&` +
      `response_type=code&` +
      `state=${state}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=plain`;
  }, []);

  const handleConnect = useCallback(() => {
    const authUrl = getXAuthUrl();
    
    if (!authUrl) {
      toast({
        title: "X (Twitter) Configuration Error",
        description: (
          <div className="space-y-2">
            <p>X (Twitter) client ID is not configured. Please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Twitter Developer Portal</a></li>
              <li>Create a new project and app</li>
              <li>Enable OAuth 2.0</li>
              <li>Add redirect URL: {window.location.origin}/auth/callback</li>
              <li>Copy the Client ID to your .env file as VITE_TWITTER_CLIENT_ID</li>
            </ol>
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      return;
    }

    window.open(authUrl, 'twitter-auth', 'width=600,height=800');
  }, [getXAuthUrl, toast]);

  // Handle message from popup window
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect X (Twitter)</DialogTitle>
          <DialogDescription>
            Sign in with your X (Twitter) account to enable tweeting and analytics
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            type="button"
            variant="outline"
            className="inline-flex items-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start"
            onClick={handleConnect}
            aria-haspopup="dialog"
            aria-expanded="true"
            data-state="open"
          >
            <img src="/x-icon.svg" alt="X (Twitter)" className="w-5 h-5 mr-2" />
            Connect X (Twitter)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
