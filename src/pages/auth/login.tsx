import { TikTokLoginButton } from "@/components/auth/TikTokLoginButton";
import { useEffect } from "react";
import { TIKTOK_CLIENT_KEY, TIKTOK_REDIRECT_URI } from "@/lib/tiktokClient";
import { Helmet } from "react-helmet-async";

export function LoginPage() {
  useEffect(() => {
    // Log TikTok configuration for debugging
    console.log('TikTok Configuration:', {
      clientKey: TIKTOK_CLIENT_KEY,
      redirectUri: TIKTOK_REDIRECT_URI
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Login - Social Media Manager</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect your social media accounts to get started
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <TikTokLoginButton />
          </div>
        </div>
      </div>
    </>
  );
}
