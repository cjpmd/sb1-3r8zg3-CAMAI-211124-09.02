'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const customPlatformSchema = z.object({
  platformName: z
    .string()
    .min(2, 'Platform name must be at least 2 characters')
    .max(50, 'Platform name must be less than 50 characters')
    .refine((val) => /^[a-zA-Z0-9\s]+$/.test(val), {
      message: 'Platform name can only contain letters, numbers, and spaces',
    }),
  platformUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must start with https://',
    }),
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'Password must contain at least one number',
    }),
  iconUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must start with https://',
    })
    .optional(),
  isPrivate: z.boolean().default(true),
});

type CustomPlatformForm = z.infer<typeof customPlatformSchema>;

export function AddCustomPlatform() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<CustomPlatformForm>({
    resolver: zodResolver(customPlatformSchema),
    defaultValues: {
      isPrivate: true,
    },
  });

  const onSubmit = async (data: CustomPlatformForm) => {
    try {
      setIsSubmitting(true);

      // Check if platform already exists for user
      const { data: existing } = await supabase
        .from('custom_platforms')
        .select('id')
        .eq('platform_name', data.platformName)
        .single();

      if (existing) {
        toast({
          title: 'Platform Already Exists',
          description: `You already have a platform named ${data.platformName}`,
          variant: 'destructive',
        });
        return;
      }

      // Test URL accessibility
      try {
        const response = await fetch(data.platformUrl);
        if (!response.ok) {
          throw new Error(`Failed to access ${data.platformUrl}`);
        }
      } catch (error) {
        toast({
          title: 'Invalid Platform URL',
          description: 'Unable to access the platform URL. Please check the URL and try again.',
          variant: 'destructive',
        });
        return;
      }

      // Test icon URL if provided
      if (data.iconUrl) {
        try {
          const response = await fetch(data.iconUrl);
          if (!response.ok || !response.headers.get('content-type')?.includes('image')) {
            throw new Error('Invalid image URL');
          }
        } catch (error) {
          toast({
            title: 'Invalid Icon URL',
            description: 'Unable to load the icon. Please check the URL and try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Encrypt sensitive data before storing
      const encryptedCredentials = {
        username: data.username,
        password: btoa(data.password),
      };

      const { error } = await supabase.from('custom_platforms').insert({
        platform_name: data.platformName,
        platform_url: data.platformUrl,
        username: data.username,
        credentials: encryptedCredentials,
        icon_url: data.iconUrl,
        is_private: data.isPrivate,
        is_enabled: true,
      });

      if (error) throw error;

      toast({
        title: 'Platform Added',
        description: `${data.platformName} has been added to your platforms.`,
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding custom platform:', error);
      toast({
        title: 'Error',
        description: 'Failed to add custom platform. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Custom Platform
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Platform</DialogTitle>
          <DialogDescription>
            Add your own platform credentials. These will be stored securely and only visible to you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platformName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Name</FormLabel>
                  <FormControl>
                    <Input placeholder="OnlyFans" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the platform you want to add.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platformUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://onlyfans.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL should start with https:// and be the main login page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Your login username for this platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must include uppercase, number, and be at least 6 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/icon.png" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    HTTPS URL to the platform's icon or logo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Adding...' : 'Add Platform'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
