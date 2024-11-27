import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { usePlatformStore } from "@/store/platformStore";
import { Image, Link, Calendar, Video, FileVideo, FileImage } from "lucide-react";
import { debugLog } from '@/utils/debug';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { platformConfigs } from './platform-config';
import { cn } from '@/lib/utils';

interface PlatformTabProps {
  platform: any;
  content: string;
  setContent: (content: string) => void;
  mediaUrl: string;
  setMediaUrl: (url: string) => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
}

function PlatformTab({ 
  platform, 
  content, 
  setContent, 
  mediaUrl, 
  setMediaUrl, 
  scheduleDate, 
  setScheduleDate 
}: PlatformTabProps) {
  const config = platformConfigs[platform.name.toLowerCase()];
  const maxLength = config?.maxLength || 280;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Content</Label>
          <span className="text-sm text-muted-foreground">
            {content.length}/{maxLength}
          </span>
        </div>
        <Textarea
          placeholder={`What's on your mind? (${maxLength} characters max)`}
          value={content}
          onChange={(e) => {
            const newContent = e.target.value;
            if (newContent.length <= maxLength) {
              setContent(newContent);
            }
          }}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-4">
        <Label>Media</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config?.supportedMedia?.includes('image') && (
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="Image URL"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <FileImage className="h-4 w-4" />
              </Button>
            </div>
          )}
          {config?.supportedMedia?.includes('video') && (
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="Video URL"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <FileVideo className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Schedule</Label>
        <div className="flex space-x-2">
          <Input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CreatePost() {
  const { user } = useAuthStore();
  const { platforms, loading: platformsLoading, fetchPlatforms } = usePlatformStore();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  // Get only connected platforms
  const connectedPlatforms = platforms.filter(platform => platform.connected === true);

  // Fetch platforms when component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      fetchPlatforms(user.id);
    }
  }, [user?.id, fetchPlatforms]);

  // Set initial active tab when platforms are loaded
  useEffect(() => {
    if (connectedPlatforms.length > 0 && !activeTab) {
      setActiveTab(connectedPlatforms[0].id);
      setSelectedPlatforms([connectedPlatforms[0].id]);
    }
  }, [connectedPlatforms, activeTab]);

  const handlePost = async () => {
    if (!user?.id || !content || selectedPlatforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in the content and select at least one platform",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            content,
            media_url: mediaUrl || null,
            schedule_date: scheduleDate || null,
            platforms: selectedPlatforms,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Clear form
      setContent("");
      setMediaUrl("");
      setScheduleDate("");
    } catch (error) {
      debugLog.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (platformsLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-muted-foreground">Loading platforms...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
          
          {connectedPlatforms.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No platforms connected</p>
              <Button variant="outline" asChild>
                <a href="/connect">Connect Platforms</a>
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                {connectedPlatforms.map((platform) => {
                  const config = platformConfigs[platform.name.toLowerCase()];
                  return (
                    <TabsTrigger
                      key={platform.id}
                      value={platform.id}
                      className="min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      onClick={() => setSelectedPlatforms([platform.id])}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4"
                          dangerouslySetInnerHTML={{ __html: config?.icon || '' }}
                          style={{ color: config?.colors.primary }}
                        />
                        <span>{platform.name}</span>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {connectedPlatforms.map((platform) => (
                <TabsContent key={platform.id} value={platform.id}>
                  <PlatformTab
                    platform={platform}
                    content={content}
                    setContent={setContent}
                    mediaUrl={mediaUrl}
                    setMediaUrl={setMediaUrl}
                    scheduleDate={scheduleDate}
                    setScheduleDate={setScheduleDate}
                  />
                </TabsContent>
              ))}

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline">Save Draft</Button>
                <Button 
                  disabled={!content || selectedPlatforms.length === 0 || loading}
                  onClick={handlePost}
                >
                  {loading ? "Posting..." : "Post Now"}
                </Button>
              </div>
            </Tabs>
          )}
        </div>
      </Card>
    </div>
  );
}
