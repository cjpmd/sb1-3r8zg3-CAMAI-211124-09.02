import { Button } from "@/components/ui/button";
import { getTikTokAuthUrl, TIKTOK_CLIENT_KEY, TIKTOK_REDIRECT_URI } from "@/lib/tiktokClient";
import { FaTiktok } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TikTokDebug } from "../debug/TikTokDebug";

export function TikTokLoginButton() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(true);

  useEffect(() => {
    // Debug output
    console.log('[TikTokLoginButton] Configuration:', {
      clientKeyExists: !!TIKTOK_CLIENT_KEY,
      redirectUri: TIKTOK_REDIRECT_URI,
      currentUrl: window.location.href,
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV
    });

    // Validate TikTok configuration on mount
    if (!TIKTOK_CLIENT_KEY) {
      console.error('[TikTokLoginButton] Client key is missing');
      setIsConfigValid(false);
      toast({
        title: "Configuration Error",
        description: "TikTok integration is not properly configured. Please check your environment variables.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleTikTokLogin = async () => {
    if (!isConfigValid) {
      console.error('[TikTokLoginButton] Configuration is invalid');
      toast({
        title: "Error",
        description: "TikTok integration is not properly configured.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('[TikTokLoginButton] Initiating login...', {
        clientKeyExists: !!TIKTOK_CLIENT_KEY,
        redirectUri: TIKTOK_REDIRECT_URI,
        currentUrl: window.location.href
      });
      
      // Generate and store return URL
      const returnUrl = window.location.href;
      localStorage.setItem('auth_return_url', returnUrl);
      console.log('[TikTokLoginButton] Stored return URL:', returnUrl);
      
      // Get auth URL
      const authUrl = getTikTokAuthUrl();
      console.log('[TikTokLoginButton] Generated auth URL:', authUrl);
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate URL before redirect
      if (!authUrl || !authUrl.includes('tiktok.com')) {
        throw new Error('Invalid TikTok authentication URL generated');
      }

      console.log('[TikTokLoginButton] Redirecting to:', authUrl);
      
      // Use window.location.href for a full page redirect
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('[TikTokLoginButton] Error:', error);
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: error.message || "Failed to initiate TikTok login. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isConfigValid) {
    return (
      <Button
        variant="outline"
        className="w-full flex items-center gap-2 bg-gray-200 text-gray-500 cursor-not-allowed"
        disabled={true}
      >
        <FaTiktok className="h-5 w-5" />
        <span>TikTok Integration Unavailable</span>
      </Button>
    );
  }

  return (
    <>
      <TikTokDebug />
      <Button
        variant="outline"
        className="w-full flex items-center gap-2 bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleTikTokLogin}
        disabled={isLoading}
      >
        <FaTiktok className="h-5 w-5" />
        {isLoading ? (
          <span>Connecting to TikTok...</span>
        ) : (
          <span>Continue with TikTok</span>
        )}
      </Button>
    </>
  );
}
