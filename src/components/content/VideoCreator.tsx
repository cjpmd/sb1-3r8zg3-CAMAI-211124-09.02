import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import {
  Camera,
  Mic,
  Video,
  Wand2,
  Type,
  Sparkles,
  Music,
  Palette,
  Brain,
  MessageSquare,
  Share2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export function VideoCreator() {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [processingVideo, setProcessingVideo] = useState(false);
  
  // AI Feature Controls
  const [aiFeatures, setAiFeatures] = useState<AIFeature[]>([
    {
      id: "realtime-transcription",
      name: "Real-time Transcription",
      description: "Convert speech to text as you record",
      icon: <Type className="w-5 h-5" />,
      enabled: true
    },
    {
      id: "smart-filters",
      name: "Smart Filters",
      description: "AI-powered video filters and effects",
      icon: <Wand2 className="w-5 h-5" />,
      enabled: true
    },
    {
      id: "content-suggestions",
      name: "Content Suggestions",
      description: "Get AI-powered content ideas while recording",
      icon: <Brain className="w-5 h-5" />,
      enabled: true
    },
    {
      id: "background-music",
      name: "AI Background Music",
      description: "Generate matching background music",
      icon: <Music className="w-5 h-5" />,
      enabled: false
    },
    {
      id: "auto-captions",
      name: "Auto Captions",
      description: "Generate and style captions automatically",
      icon: <MessageSquare className="w-5 h-5" />,
      enabled: true
    },
    {
      id: "style-transfer",
      name: "Style Transfer",
      description: "Apply AI art styles to your video",
      icon: <Palette className="w-5 h-5" />,
      enabled: false
    }
  ]);

  // Recording settings
  const [settings, setSettings] = useState({
    videoQuality: 'hd', // sd, hd, 4k
    audioEnabled: true,
    enhanceLighting: true,
    backgroundBlur: 0,
    autoFraming: true
  });

  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user"
        },
        audio: settings.audioEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Add success toast
      toast({
        title: "Camera Ready",
        description: "Your camera has been initialized successfully.",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions."
      });
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    // Start AI features
    if (aiFeatures.find(f => f.id === "realtime-transcription")?.enabled) {
      startTranscription();
    }
    if (aiFeatures.find(f => f.id === "content-suggestions")?.enabled) {
      generateSuggestions();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowPreview(true);
    }
  };

  const startTranscription = () => {
    // Simulated real-time transcription
    // In production, integrate with a service like Azure Speech Services or Google Speech-to-Text
    const mockTranscription = setInterval(() => {
      setTranscription(prev => prev + " " + generateRandomWord());
    }, 1000);

    return () => clearInterval(mockTranscription);
  };

  const generateSuggestions = () => {
    // Simulated AI content suggestions
    // In production, integrate with GPT or similar AI service
    setSuggestions([
      "Try moving closer to the camera",
      "Speak with more energy",
      "Consider adding a prop",
      "Good lighting! Keep it up"
    ]);
  };

  const processVideo = async () => {
    setProcessingVideo(true);
    
    try {
      // Simulate video processing with AI features
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // In production, send to backend for processing with selected AI features
      
      toast({
        title: "Success",
        description: "Video processed successfully!"
      });
      
      return url;
    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process video with AI features."
      });
    } finally {
      setProcessingVideo(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setAiFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  // Helper function for mock transcription
  const generateRandomWord = () => {
    const words = ["amazing", "content", "creating", "video", "social", "media"];
    return words[Math.floor(Math.random() * words.length)];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Create Content
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Record and enhance your video with AI
          </p>
        </div>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center space-x-2 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isRecording ? (
            <>
              <Video className="w-5 h-5" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>Start Recording</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video bg-black/90 rounded-lg"
            />
          </Card>
          
          {/* Recording Controls */}
          <div className="mt-4 space-y-4">
            <Card className="p-4 space-y-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <div className="flex items-center justify-between">
                <span className="font-medium">Audio Enabled</span>
                <Switch
                  checked={settings.audioEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, audioEnabled: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Background Blur</span>
                  <span className="text-sm text-muted-foreground">{settings.backgroundBlur}%</span>
                </div>
                <Slider
                  value={[settings.backgroundBlur]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={([value]) =>
                    setSettings(prev => ({ ...prev, backgroundBlur: value }))
                  }
                />
              </div>
            </Card>
          </div>
        </div>

        {/* AI Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Features</h2>
          {aiFeatures.map((feature) => (
            <Card
              key={feature.id}
              className={`p-4 cursor-pointer transition-all ${
                feature.enabled
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                  : ''
              }`}
              onClick={() => toggleFeature(feature.id)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    feature.enabled
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium">{feature.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
                <Switch className="ml-auto" checked={feature.enabled} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Real-time AI Feedback */}
      {isRecording && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiFeatures.find(f => f.id === "realtime-transcription")?.enabled && (
            <Card className="p-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Type className="w-4 h-4" />
                <span>Live Transcription</span>
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {transcription || "Listening..."}
              </p>
            </Card>
          )}
          
          {aiFeatures.find(f => f.id === "content-suggestions")?.enabled && (
            <Card className="p-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Suggestions</span>
              </h3>
              <ul className="mt-2 space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2"
                  >
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Video Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview & Share</DialogTitle>
            <DialogDescription>
              Review your video and apply AI enhancements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <video
              controls
              className="w-full aspect-video bg-black rounded-lg"
              src={recordedChunks.length ? URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' })) : ''}
            />
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setRecordedChunks([]);
                }}
              >
                Discard
              </Button>
              
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={processVideo}
                  disabled={processingVideo}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Apply AI Effects
                </Button>
                
                <Button onClick={() => {/* Implement share logic */}}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
