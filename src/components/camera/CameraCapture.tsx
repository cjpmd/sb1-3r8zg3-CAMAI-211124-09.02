import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Video, X, FlipHorizontal, Share2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  platforms: z.object({
    instagram: z.boolean(),
    tiktok: z.boolean(),
    youtube: z.boolean(),
    facebook: z.boolean(),
  }),
});

interface CameraCaptureProps {
  onClose?: () => void;
}

export function CameraCapture({ onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [mediaToShare, setMediaToShare] = useState<{ type: 'photo' | 'video', blob: Blob } | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      platforms: {
        instagram: true,
        tiktok: true,
        youtube: true,
        facebook: true,
      },
    },
  });

  const videoConstraints = {
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    facingMode,
    aspectRatio: 9/16
  };

  const handleStartRecording = useCallback(() => {
    chunksRef.current = [];
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        setMediaToShare({ type: 'video', blob: videoBlob });
        setShowShareDialog(true);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const takePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            setMediaToShare({ type: 'photo', blob });
            setShowShareDialog(true);
          });
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, []);

  const handleShare = async (data: z.infer<typeof formSchema>) => {
    if (!mediaToShare) return;

    setIsSharing(true);
    try {
      const formData = new FormData();
      formData.append('file', mediaToShare.blob);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('type', mediaToShare.type);
      formData.append('platforms', JSON.stringify(data.platforms));

      const response = await fetch('/api/social/share', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to share media');
      }

      toast({
        title: 'Success!',
        description: 'Your content has been shared to selected platforms.',
      });

      setShowShareDialog(false);
      setMediaToShare(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share your content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Card className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'photo' ? 'default' : 'outline'}
              onClick={() => setMode('photo')}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant={mode === 'video' ? 'default' : 'outline'}
              onClick={() => setMode('video')}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant="outline"
              onClick={toggleCamera}
            >
              <FlipHorizontal className="w-4 h-4" />
            </Button>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4">
          <Webcam
            ref={webcamRef}
            audio={mode === 'video'}
            videoConstraints={videoConstraints}
            screenshotFormat="image/png"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center">
          {mode === 'photo' ? (
            <Button onClick={takePhoto}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          ) : (
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              variant={isRecording ? 'destructive' : 'default'}
            >
              <Video className="w-4 h-4 mr-2" />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share to Social Media</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleShare)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platforms.instagram"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Share to Instagram</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platforms.tiktok"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Share to TikTok</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platforms.youtube"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Share to YouTube</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platforms.facebook"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Share to Facebook</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSharing}>
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
