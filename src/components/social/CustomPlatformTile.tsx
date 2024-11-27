import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Globe, Loader2 } from 'lucide-react';
import { CustomPlatform } from './CustomPlatform';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface CustomPlatformTileProps {
  platform: CustomPlatform;
  onDelete: (platformId: string) => void;
}

export function CustomPlatformTile({ platform, onDelete }: CustomPlatformTileProps) {
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('custom_platforms')
        .delete()
        .eq('id', platform.id);

      if (error) throw error;

      onDelete(platform.id);
      toast({
        title: "Platform Disconnected",
        description: `${platform.name} has been removed successfully.`,
      });
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive",
      });
      setConnected(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionToggle = (checked: boolean) => {
    if (!checked) {
      handleDisconnect();
    }
    setConnected(checked);
  };

  return (
    <Card className={cn(
      "p-6 hover:shadow-lg transition-shadow",
      "bg-gradient-to-br from-gray-500/10 to-gray-600/10"
    )}>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                {imageError ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <img
                    src={platform.iconUrl}
                    alt={`${platform.name} logo`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </>
            )}
            <div>
              <h3 className="font-semibold">{platform.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {platform.url}
              </p>
            </div>
          </div>
          <Switch
            checked={connected}
            onCheckedChange={handleConnectionToggle}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-post</span>
            <Switch disabled={!connected} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Cross-post</span>
            <Switch disabled={!connected} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notifications</span>
            <Switch disabled={!connected} />
          </div>
        </div>
      </div>
    </Card>
  );
}
