import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/authStore";
import { usePlatformStore } from "@/store/platformStore";
import { TikTokAuthDialog } from "./TikTokAuthDialog";
import { YouTubeAuthDialog } from "./YouTubeAuthDialog";
import { InstagramAuthDialog } from "./InstagramAuthDialog";
import { FacebookAuthDialog } from "./FacebookAuthDialog";
import { XAuthDialog } from "./XAuthDialog";
import { platformConfigs } from "./platform-config";

export function ConnectAccounts() {
  // Auth state
  const user = useAuthStore(state => state.user);
  
  // Platform state
  const platforms = usePlatformStore(state => state.platforms);
  const loading = usePlatformStore(state => state.loading);
  const fetchPlatforms = usePlatformStore(state => state.fetchPlatforms);

  // Custom platform dialog state
  const [showCustomPlatformDialog, setShowCustomPlatformDialog] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState("");

  // Dialog state
  const [authDialogs, setAuthDialogs] = useState({
    tiktok: false,
    youtube: false,
    instagram: false,
    facebook: false,
    x: false,
  });

  const handleDisconnect = useCallback(async (platformId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform_id', platformId);

      if (error) throw error;

      await fetchPlatforms(user.id);
      
      toast({
        title: "Account Disconnected",
        description: "Your account has been disconnected successfully.",
      });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      });
    }
  }, [user?.id, fetchPlatforms]);

  const handleConnect = useCallback((platformName: string) => {
    const platform = platformName.toLowerCase();
    setAuthDialogs(prev => ({
      ...prev,
      [platform]: true
    }));
  }, []);

  const handleDialogClose = useCallback((platform: string) => {
    setAuthDialogs(prev => ({
      ...prev,
      [platform]: false
    }));
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    if (!user?.id) return;
    await fetchPlatforms(user.id);
    
    toast({
      title: "Success",
      description: "Platform connected successfully!",
    });
  }, [user?.id, fetchPlatforms]);

  const handleCustomPlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for custom platform addition
    setShowCustomPlatformDialog(false);
    setCustomPlatformName("");
  };

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchPlatforms(user.id);
    }
  }, [user?.id, fetchPlatforms]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 mb-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-br from-primary to-primary-foreground bg-clip-text text-transparent animate-gradient mb-3">Connect Your Accounts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Link your social media accounts to manage all your content in one place. Connect multiple platforms to maximize your reach.</p>
        </div>
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-black/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(platform => {
          const platformName = platform.name.toLowerCase();
          const config = platformConfigs[platformName];
          const buttonId = `radix-:r${platform.id}:`;
          
          if (!config) return null;
          
          return (
            <Card 
              key={platform.id} 
              className="relative group overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5"
              style={{
                '--platform-color-primary': config.colors.primary,
                '--platform-color-secondary': config.colors.secondary,
              } as React.CSSProperties}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--platform-color-primary)/10] via-[var(--platform-color-secondary)/5] to-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative p-6 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-xl transition-colors duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${config.colors.primary}20, ${config.colors.secondary}10)`,
                      }}
                    >
                      <div 
                        className="w-7 h-7"
                        style={{ color: config.colors.primary }}
                        dangerouslySetInnerHTML={{ __html: config.icon }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{platform.name}</h3>
                      {platform.username ? (
                        <p className="text-sm text-muted-foreground">@{platform.username}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      )}
                    </div>
                  </div>
                  {platform.connected && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium text-emerald-500">Connected</span>
                    </div>
                  )}
                </div>
                
                {platform.connected ? (
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(platform.id)}
                    className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive/90 hover:border-destructive transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => handleConnect(platformName)}
                    className="w-full transition-all duration-300 shadow-sm border-0"
                    style={{
                      background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                    }}
                    aria-haspopup="dialog"
                    aria-expanded={authDialogs[platformName]}
                    aria-controls={buttonId}
                    data-state={authDialogs[platformName] ? "open" : "closed"}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className="w-4 h-4 mr-2"
                    >
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Dialog open={showCustomPlatformDialog} onOpenChange={setShowCustomPlatformDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="group relative overflow-hidden border-dashed hover:border-solid transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-2"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add Custom Platform
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Custom Platform</DialogTitle>
              <DialogDescription className="text-base">
                Add a custom social media platform that's not listed above.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCustomPlatformSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platformName" className="text-sm font-medium">Platform Name</Label>
                <Input 
                  id="platformName" 
                  value={customPlatformName} 
                  onChange={(e) => setCustomPlatformName(e.target.value)} 
                  placeholder="Enter platform name"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300"
                >
                  Add Platform
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Render only the active auth dialog */}
      {Object.entries(authDialogs).map(([platform, isOpen]) => {
        if (!isOpen) return null;
        
        switch (platform) {
          case 'tiktok':
            return <TikTokAuthDialog key={platform} isOpen={true} onClose={() => handleDialogClose(platform)} onSuccess={handleAuthSuccess} />;
          case 'youtube':
            return <YouTubeAuthDialog key={platform} isOpen={true} onClose={() => handleDialogClose(platform)} onSuccess={handleAuthSuccess} />;
          case 'instagram':
            return <InstagramAuthDialog key={platform} isOpen={true} onClose={() => handleDialogClose(platform)} onSuccess={handleAuthSuccess} />;
          case 'facebook':
            return <FacebookAuthDialog key={platform} isOpen={true} onClose={() => handleDialogClose(platform)} onSuccess={handleAuthSuccess} />;
          case 'x':
            return <XAuthDialog key={platform} isOpen={true} onClose={() => handleDialogClose(platform)} onSuccess={handleAuthSuccess} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
