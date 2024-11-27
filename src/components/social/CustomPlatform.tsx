import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Globe, Plus } from 'lucide-react';

export interface CustomPlatform {
  id: string;
  name: string;
  url: string;
  iconUrl: string;
  oauthConfig: {
    authUrl: string;
    tokenUrl: string;
    clientId: string;
    scope: string;
  };
  userId: string;
}

interface CustomPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlatformAdded: (platform: CustomPlatform) => void;
}

export function CustomPlatformDialog({ open, onOpenChange, onPlatformAdded }: CustomPlatformDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [platformData, setPlatformData] = useState({
    name: '',
    url: '',
    iconUrl: '',
    oauthConfig: {
      authUrl: '',
      tokenUrl: '',
      clientId: '',
      scope: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Instead of adding a custom platform, initiate OAuth flow
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const state = Math.random().toString(36).substring(7);
      
      // Store OAuth state and platform info in session storage
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_platform', platformData.name);
      sessionStorage.setItem('oauth_redirect', window.location.href);

      // Build OAuth URL
      const authUrl = new URL(platformData.oauthConfig.authUrl);
      authUrl.searchParams.append('client_id', platformData.oauthConfig.clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('scope', platformData.oauthConfig.scope);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('response_type', 'code');

      // Redirect to OAuth login
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
      toast({
        title: "Error",
        description: "Failed to connect to platform",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to Platform</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Platform Name</Label>
            <Input
              id="name"
              value={platformData.name}
              onChange={(e) => setPlatformData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Mastodon"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Platform URL</Label>
            <Input
              id="url"
              value={platformData.url}
              onChange={(e) => setPlatformData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="e.g., https://mastodon.social"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iconUrl">Icon URL</Label>
            <Input
              id="iconUrl"
              value={platformData.iconUrl}
              onChange={(e) => setPlatformData(prev => ({ ...prev, iconUrl: e.target.value }))}
              placeholder="e.g., https://mastodon.social/favicon.ico"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authUrl">OAuth Authorization URL</Label>
            <Input
              id="authUrl"
              value={platformData.oauthConfig.authUrl}
              onChange={(e) => setPlatformData(prev => ({
                ...prev,
                oauthConfig: { ...prev.oauthConfig, authUrl: e.target.value }
              }))}
              placeholder="e.g., https://mastodon.social/oauth/authorize"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenUrl">OAuth Token URL</Label>
            <Input
              id="tokenUrl"
              value={platformData.oauthConfig.tokenUrl}
              onChange={(e) => setPlatformData(prev => ({
                ...prev,
                oauthConfig: { ...prev.oauthConfig, tokenUrl: e.target.value }
              }))}
              placeholder="e.g., https://mastodon.social/oauth/token"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">OAuth Client ID</Label>
            <Input
              id="clientId"
              value={platformData.oauthConfig.clientId}
              onChange={(e) => setPlatformData(prev => ({
                ...prev,
                oauthConfig: { ...prev.oauthConfig, clientId: e.target.value }
              }))}
              placeholder="Your client ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scope">OAuth Scope</Label>
            <Input
              id="scope"
              value={platformData.oauthConfig.scope}
              onChange={(e) => setPlatformData(prev => ({
                ...prev,
                oauthConfig: { ...prev.oauthConfig, scope: e.target.value }
              }))}
              placeholder="e.g., read write"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connecting..." : "Connect"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddCustomPlatformCard({ onClick }: { onClick: () => void }) {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-dashed"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold">Connect Another Platform</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add support for other social media platforms
          </p>
        </div>
      </div>
    </Card>
  );
}
