import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

const formSchema = z.object({
  file: z.any()
    .refine((files) => files?.length > 0, "Content file is required")
    .refine(
      (files) => files?.[0]?.size <= 100 * 1024 * 1024,
      "File size should be less than 100MB"
    ),
  thumbnail: z.any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= 5 * 1024 * 1024,
      "Thumbnail size should be less than 5MB"
    ),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  tags: z.string().max(500, "Tags are too long").optional(),
  location: z.string().max(100, "Location is too long").optional(),
  scheduledTime: z.date().optional(),
  platforms: z.object({
    instagram: z.boolean(),
    tiktok: z.boolean(),
    youtube: z.boolean(),
    facebook: z.boolean(),
  }).refine((data) => Object.values(data).some(Boolean), {
    message: "Please select at least one platform",
  }),
  visibility: z.enum(["public", "private"]),
});

interface ConnectedAccount {
  platform: string;
  username: string;
}

export function SocialUploader() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      location: '',
      platforms: {
        instagram: false,
        tiktok: false,
        youtube: false,
        facebook: false,
      },
      visibility: 'public',
    },
  });

  useEffect(() => {
    if (user) {
      fetchConnectedAccounts();
    }
  }, [user]);

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setConnectedAccounts(
        data.map((account) => ({
          platform: account.platform,
          username: account.username,
        }))
      );
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch connected accounts',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Check if any platform is selected
      const selectedPlatforms = Object.entries(values.platforms)
        .filter(([_, selected]) => selected)
        .map(([platform]) => platform);

      if (selectedPlatforms.length === 0) {
        throw new Error('Please select at least one platform');
      }

      // Check if file is selected
      if (!values.file || values.file.length === 0) {
        throw new Error('Please select a file to upload');
      }

      const file = values.file[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('social-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Upload thumbnail if provided
      let thumbnailPath = '';
      if (values.thumbnail && values.thumbnail.length > 0) {
        const thumbnail = values.thumbnail[0];
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbName = `${Math.random()}.${thumbExt}`;
        thumbnailPath = `${user?.id}/thumbnails/${thumbName}`;

        const { error: thumbError } = await supabase.storage
          .from('social-uploads')
          .upload(thumbnailPath, thumbnail);

        if (thumbError) throw thumbError;
      }

      // Create social media post record
      const { error: postError } = await supabase.from('social_posts').insert({
        user_id: user?.id,
        file_path: filePath,
        thumbnail_path: thumbnailPath,
        title: values.title,
        description: values.description,
        tags: values.tags?.split(',').map((tag) => tag.trim()),
        location: values.location,
        scheduled_time: values.scheduledTime,
        platforms: selectedPlatforms,
        visibility: values.visibility,
        status: 'pending',
      });

      if (postError) throw postError;

      toast({
        title: 'Success',
        description: 'Content scheduled for upload',
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload content',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Upload Content</h2>
          <p className="text-muted-foreground">Share your content across multiple platforms</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* File Upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Content</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*,image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                      className="cursor-pointer file:cursor-pointer file:border-0 file:bg-secondary file:text-secondary-foreground file:hover:bg-secondary/80"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a video or image file (max 100MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thumbnail Upload */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Thumbnail (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                      className="cursor-pointer file:cursor-pointer file:border-0 file:bg-secondary file:text-secondary-foreground file:hover:bg-secondary/80"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a custom thumbnail image (max 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background" />
                  </FormControl>
                  <FormDescription>
                    Give your content a title (max 100 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-background resize-y min-h-[100px]" />
                  </FormControl>
                  <FormDescription>
                    Describe your content (max 2000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Tags</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="tag1, tag2, tag3" className="bg-background" />
                  </FormControl>
                  <FormDescription>
                    Add tags to help people find your content (comma-separated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Location</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background" />
                  </FormControl>
                  <FormDescription>
                    Add a location to your post (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled Time */}
            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base font-semibold">Schedule Post</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select when to publish your content (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Platforms */}
            <div className="space-y-4">
              <FormLabel className="text-base font-semibold">Platforms</FormLabel>
              {connectedAccounts.map((account) => (
                <FormField
                  key={account.platform}
                  control={form.control}
                  name={`platforms.${account.platform.toLowerCase()}` as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          {account.platform} ({account.username})
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
              {connectedAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No connected accounts. Please connect your social media accounts first.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Content"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
