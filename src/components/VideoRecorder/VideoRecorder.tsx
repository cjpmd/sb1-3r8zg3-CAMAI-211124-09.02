import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, StopCircle, Loader, Settings, X, FlipHorizontal, Share2 } from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';
import { useEditorStore } from '../../store/editorStore';
import { AIControls } from '../VideoEditor/AIControls';
import { generateVoiceover } from '../../lib/voiceService';
import { uploadToSocial, connectSocialAccount } from '../../lib/socialShare';

interface VideoRecorderProps {
  onClose: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIControls, setShowAIControls] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const addVideo = useVideoStore(state => state.addVideo);
  const { selectedTheme, voiceId } = useEditorStore();

  const videoConstraints = {
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    facingMode,
    aspectRatio: 9/16
  };

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    if (webcamRef.current) {
      const stream = webcamRef.current.video!.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(videoBlob);
        
        try {
          // Save to IndexedDB
          const videoId = Date.now().toString();
          await addVideo({
            id: videoId,
            blob: videoBlob,
            caption: 'My new video 🎥',
            likes: 0,
            userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
            username: 'creator'
          });

          // Save to device
          const url = URL.createObjectURL(videoBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `video-${videoId}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

        } catch (error) {
          console.error('Failed to save video:', error);
        }

        setIsProcessing(false);
        setShowSocialShare(true);
      };

      mediaRecorderRef.current.start();
    }
  }, [addVideo]);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleSocialShare = async (platform: string) => {
    if (!recordedBlob) return;

    try {
      setIsProcessing(true);
      await connectSocialAccount(platform);
      const url = await uploadToSocial(platform, recordedBlob, 'Check out my new video!');
      console.log(`Uploaded to ${platform}:`, url);
    } catch (error) {
      console.error(`Failed to share to ${platform}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 ${selectedTheme.background} z-50 flex flex-col touch-none`}
    >
      <div className="relative flex-1">
        <Webcam
          audio={true}
          ref={webcamRef}
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          screenshotFormat="image/jpeg"
        />
        
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4 z-50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full bg-gray-900/50 backdrop-blur-sm"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCamera}
              className="p-2 rounded-full bg-gray-900/50 backdrop-blur-sm"
            >
              <FlipHorizontal className="w-6 h-6 text-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAIControls(!showAIControls)}
              className="p-2 rounded-full bg-gray-900/50 backdrop-blur-sm"
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.button>

            {recordedBlob && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSocialShare(!showSocialShare)}
                className="p-2 rounded-full bg-gray-900/50 backdrop-blur-sm"
              >
                <Share2 className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 p-6 rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-white'
          } shadow-lg`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader className="w-8 h-8 animate-spin text-gray-900" />
          ) : isRecording ? (
            <StopCircle className="w-8 h-8 text-white" />
          ) : (
            <Video className="w-8 h-8 text-gray-900" />
          )}
        </motion.button>

        <AnimatePresence>
          {showAIControls && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="absolute top-0 right-0 w-full sm:w-80 h-full bg-gray-900/90 backdrop-blur-sm"
            >
              <AIControls onVoiceSelect={async (text) => {
                try {
                  const voiceoverBlob = await generateVoiceover(text, voiceId);
                  // Handle the voiceover blob (e.g., merge with video)
                } catch (error) {
                  console.error('Failed to generate voiceover:', error);
                }
              }} />
            </motion.div>
          )}

          {showSocialShare && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/90 backdrop-blur-sm rounded-t-2xl"
            >
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSocialShare('tiktok')}
                  className="p-4 rounded-lg bg-black text-white font-medium hover:bg-gray-900"
                >
                  Share to TikTok
                </button>
                <button
                  onClick={() => handleSocialShare('instagram')}
                  className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600"
                >
                  Share to Instagram
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};