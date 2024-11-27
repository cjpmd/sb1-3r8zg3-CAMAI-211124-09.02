import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Camera, 
  Sparkles,
  Wand2,
  Type,
  Music,
  MessageSquare,
  Palette,
  Brain,
  Camera as CameraIcon,
  Upload,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  CheckCircle,
  X,
  Globe,
  Send,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentStore } from '@/store/contentStore';
import { ContentScheduler } from './ContentScheduler';
import { AIContentDialog } from './AIContentDialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  color: string;
  iconColor: string;
}

interface PlatformMetadata {
  hashtags: string[];
  mentions: string[];
  locationTag: string;
}

type PlatformMetadataMap = Record<string, PlatformMetadata>;

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const CONNECTED_ACCOUNTS = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    username: '@johndoe',
    color: 'from-pink-500 to-purple-500',
    iconColor: 'text-pink-500'
  },
  { 
    id: 'twitter', 
    name: 'Twitter/X', 
    icon: Twitter, 
    username: '@johndoe',
    color: 'from-blue-400 to-blue-600',
    iconColor: 'text-blue-400'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    username: 'John Doe',
    color: 'from-blue-600 to-blue-800',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: Video, 
    username: '@johndoe',
    color: 'from-pink-500 to-cyan-500',
    iconColor: 'text-pink-500'
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    username: 'John Doe',
    color: 'from-red-500 to-red-700',
    iconColor: 'text-red-500'
  }
];

const TRENDING_HASHTAGS = ['#trending', '#viral', '#photography', '#art', '#fashion', '#lifestyle', '#tech', '#innovation', '#fyp', '#foryou', '#viral', '#trending', '#gaming', '#vlog', '#tutorial'];
const SUGGESTED_MENTIONS = ['@instagram', '@twitter', '@creator', '@design', '@tech', '@tiktok', '@youtube', '@facebook', '@meta'];

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'tiktok', name: 'TikTok', icon: Video },
  { id: 'youtube', name: 'YouTube', icon: Youtube }
];

const AI_FEATURES = [
  {
    id: 'enhance',
    name: 'Auto Enhance',
    description: 'AI-powered quality enhancement',
    icon: <Wand2 className="h-5 w-5" />,
    enabled: true,
    color: 'from-purple-500 to-indigo-500',
    iconColor: 'text-purple-300'
  },
  {
    id: 'captions',
    name: 'Auto Captions',
    description: 'Generate captions automatically',
    icon: <Type className="h-5 w-5" />,
    enabled: true,
    color: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-300'
  },
  {
    id: 'effects',
    name: 'Smart Effects',
    description: 'AI visual effects and filters',
    icon: <Sparkles className="h-5 w-5" />,
    enabled: false,
    color: 'from-amber-500 to-orange-500',
    iconColor: 'text-amber-300'
  },
  {
    id: 'music',
    name: 'Background Music',
    description: 'AI-generated background music',
    icon: <Music className="h-5 w-5" />,
    enabled: false,
    color: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-300'
  },
  {
    id: 'style',
    name: 'Style Transfer',
    description: 'Apply AI art styles',
    icon: <Palette className="h-5 w-5" />,
    enabled: false,
    color: 'from-pink-500 to-rose-500',
    iconColor: 'text-pink-300'
  },
  {
    id: 'suggestions',
    name: 'Content Coach',
    description: 'Real-time AI suggestions',
    icon: <Brain className="h-5 w-5" />,
    enabled: true,
    color: 'from-violet-500 to-purple-500',
    iconColor: 'text-violet-300'
  }
];

export function ContentCreationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [sharedMetadata, setSharedMetadata] = useState<{
    hashtags: string[];
    mentions: string[];
    locationTag: string;
  }>({
    hashtags: [],
    mentions: [],
    locationTag: ''
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('video');
  const [aiFeatures, setAiFeatures] = useState<AIFeature[]>(AI_FEATURES);
  const [brightness, setBrightness] = useState([1]);
  const [contrast, setContrast] = useState([1]);
  const [saturation, setSaturation] = useState([1]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tempInput, setTempInput] = useState({ platform: '', type: '', value: '' });

  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      setCameraError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Failed to access camera';
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access to use this feature.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera to use this feature.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.';
        }
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCameraLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const retryCamera = () => {
    startCamera();
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const enhancedBlob = await applyAIEnhancements(blob);
      const file = new File([enhancedBlob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
      const preview = URL.createObjectURL(enhancedBlob);
      setMediaFiles(prev => [...prev, { file, preview, type: 'video' }]);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const enhancedBlob = await applyAIEnhancements(blob);
      const file = new File([enhancedBlob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const preview = URL.createObjectURL(enhancedBlob);
      setMediaFiles(prev => [...prev, { file, preview, type: 'image' }]);
    }, 'image/jpeg');
  };

  const applyAIEnhancements = async (blob: Blob): Promise<Blob> => {
    const enabledFeatures = aiFeatures.filter(f => f.enabled);
    
    if (enabledFeatures.length === 0) return blob;

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "AI Enhancement",
      description: `Applied: ${enabledFeatures.map(f => f.name).join(', ')}`,
    });

    return blob;
  };

  const toggleFeature = (featureId: string) => {
    setAiFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 50MB limit`,
        });
        return false;
      }

      if (![...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type`,
        });
        return false;
      }

      return true;
    });

    const newMediaFiles = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const type = SUPPORTED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video';
        return { file, preview, type };
      })
    );

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || platforms.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      // Handle form submission
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create content. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (platformId: string) => {
    if (platforms.includes(platformId)) {
      setPlatforms(platforms.filter(p => p !== platformId));
    } else {
      setPlatforms([...platforms, platformId]);
    }
  };

  const handleTagAdd = (type: 'hashtags' | 'mentions', value: string) => {
    const formattedValue = type === 'hashtags' 
      ? (value.startsWith('#') ? value : `#${value}`)
      : (value.startsWith('@') ? value : `@${value}`);

    setSharedMetadata(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), formattedValue]
    }));
    setTempInput({ platform: '', type: '', value: '' });
  };

  const handleTagRemove = (type: 'hashtags' | 'mentions', tagToRemove: string) => {
    setSharedMetadata(prev => ({
      ...prev,
      [type]: prev[type].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'hashtags' | 'mentions'
  ) => {
    if (e.key === 'Enter' && tempInput.value.trim()) {
      e.preventDefault();
      handleTagAdd(type, tempInput.value.trim());
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Content</h1>
          <AIContentDialog
            platforms={platforms}
            onSelect={(content: { post: string }) => {
              setPost(content.post);
            }}
            currentContent={post ? { post } : undefined}
          />
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="grid gap-8">
            {/* Camera Section */}
            <section className="space-y-6">
              {/* Camera Preview */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] bg-black rounded-lg overflow-hidden">
                {isCameraLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : cameraError ? (
                  <div className="flex justify-center items-center h-full text-red-500">
                    <p className="text-center">{cameraError}</p>
                    <Button onClick={retryCamera} className="mt-4 bg-purple-600 hover:bg-purple-700">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{
                      filter: `brightness(${brightness[0]}) contrast(${contrast[0]}) saturate(${saturation[0]})`
                    }}
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Controls */}
              <div className="space-y-6">
                {/* Photo/Video Toggle */}
                <div className="flex justify-center">
                  <Tabs defaultValue="video" className="w-full max-w-md" onValueChange={(value) => setMode(value as 'photo' | 'video')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="photo" className="data-[state=active]:bg-purple-600">
                        <Camera className="w-4 h-4 mr-2" />
                        Photo
                      </TabsTrigger>
                      <TabsTrigger value="video" className="data-[state=active]:bg-purple-600">
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="photo" className="flex justify-center mt-4">
                      <Button onClick={takePhoto} className="gap-2 bg-purple-600 hover:bg-purple-700">
                        <CameraIcon className="w-4 h-4" />
                        Take Photo
                      </Button>
                    </TabsContent>
                    <TabsContent value="video" className="flex justify-center mt-4">
                      {!isRecording ? (
                        <Button onClick={startRecording} variant="default" className="gap-2 bg-purple-600 hover:bg-purple-700">
                          <Video className="w-4 h-4" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} variant="destructive" className="gap-2">
                          <Video className="w-4 h-4" />
                          Stop Recording
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Image Adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Brightness</Label>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Contrast</Label>
                    <Slider
                      value={contrast}
                      onValueChange={setContrast}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Saturation</Label>
                    <Slider
                      value={saturation}
                      onValueChange={setSaturation}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Content Section */}
            <section className="grid gap-6">
              {/* AI Features */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-200">AI Enhancements</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {AI_FEATURES.map(feature => (
                    <Button
                      key={feature.id}
                      variant="outline"
                      className={cn(
                        "h-24 flex flex-col items-center justify-center gap-2 p-4 relative overflow-hidden",
                        feature.enabled 
                          ? `border-transparent bg-gradient-to-br ${feature.color}`
                          : "border-gray-700 hover:border-gray-600"
                      )}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className={cn(
                        "rounded-full p-2",
                        feature.enabled ? 'bg-white/20' : 'bg-gray-800'
                      )}>
                        {feature.icon}
                      </div>
                      <span className={cn(
                        "text-sm text-center",
                        feature.enabled ? "text-white" : "text-gray-400"
                      )}>
                        {feature.name}
                      </span>
                      {feature.enabled && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-3 h-3 text-white/80" />
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Post
                </label>
                <Textarea
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="h-32 bg-gray-900/50"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-200">
                  Connected Accounts
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {CONNECTED_ACCOUNTS.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = platforms.includes(platform.id);
                    
                    return (
                      <div
                        key={platform.id}
                        onClick={() => handlePlatformChange(platform.id)}
                        className={`
                          relative p-4 rounded-lg border-2 cursor-pointer
                          transition-all duration-200 ease-in-out
                          ${isSelected 
                            ? `bg-gradient-to-br ${platform.color} border-transparent` 
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : platform.iconColor}`} />
                          <div className="flex flex-col">
                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {platform.name}
                            </span>
                            <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                              {platform.username}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shared Settings Box */}
              {platforms.length > 0 && (
                <div className="space-y-6 p-6 rounded-lg bg-gray-800/50">
                  {/* Hashtags Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Hashtags</label>
                    <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-gray-900/50 rounded-lg">
                      {sharedMetadata.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => handleTagRemove('hashtags', tag)}
                            className="hover:text-purple-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Add hashtag..."
                        className="flex-1 min-w-[120px] bg-transparent border-none focus:outline-none text-sm text-gray-300"
                        value={tempInput.type === 'hashtags' ? tempInput.value : ''}
                        onChange={(e) => setTempInput({ platform: '', type: 'hashtags', value: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, 'hashtags')}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_HASHTAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagAdd('hashtags', tag)}
                          className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                          disabled={sharedMetadata.hashtags.includes(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mentions Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Mentions</label>
                    <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-gray-900/50 rounded-lg">
                      {sharedMetadata.mentions.map((mention) => (
                        <span
                          key={mention}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {mention}
                          <button
                            onClick={() => handleTagRemove('mentions', mention)}
                            className="hover:text-purple-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Add mention..."
                        className="flex-1 min-w-[120px] bg-transparent border-none focus:outline-none text-sm text-gray-300"
                        value={tempInput.type === 'mentions' ? tempInput.value : ''}
                        onChange={(e) => setTempInput({ platform: '', type: 'mentions', value: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, 'mentions')}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_MENTIONS.map((mention) => (
                        <button
                          key={mention}
                          onClick={() => handleTagAdd('mentions', mention)}
                          className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                          disabled={sharedMetadata.mentions.includes(mention)}
                        >
                          {mention}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Tag */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Location</label>
                    <Input
                      placeholder="Add location"
                      value={sharedMetadata.locationTag}
                      onChange={(e) => setSharedMetadata(prev => ({
                        ...prev,
                        locationTag: e.target.value
                      }))}
                      className="bg-gray-900/50"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={loading || platforms.length === 0} 
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Content
                    </>
                  )}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
