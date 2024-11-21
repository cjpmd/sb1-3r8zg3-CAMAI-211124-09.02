import React, { useState } from 'react';
import { Mic, Image, Type, Palette, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../store/editorStore';
import { voiceOptions } from '../../lib/voiceService';

interface AIControlsProps {
  onVoiceSelect: (text: string) => Promise<void>;
}

export const AIControls: React.FC<AIControlsProps> = ({ onVoiceSelect }) => {
  const [activeTab, setActiveTab] = useState('voice');
  const [voiceText, setVoiceText] = useState('');
  const { voiceId, setVoiceId, storyTone, setStoryTone } = useEditorStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleVoiceGeneration = async () => {
    if (!voiceText) return;
    setIsGenerating(true);
    try {
      await onVoiceSelect(voiceText);
    } catch (error) {
      console.error('Failed to generate voice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const previewVoice = (previewUrl: string) => {
    const audio = new Audio(previewUrl);
    audio.play();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4">
      <div className="flex space-x-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('voice')}
          className={`p-2 rounded-lg ${
            activeTab === 'voice' ? 'bg-indigo-600' : 'bg-gray-800'
          }`}
        >
          <Mic className="w-6 h-6 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('image')}
          className={`p-2 rounded-lg ${
            activeTab === 'image' ? 'bg-indigo-600' : 'bg-gray-800'
          }`}
        >
          <Image className="w-6 h-6 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('theme')}
          className={`p-2 rounded-lg ${
            activeTab === 'theme' ? 'bg-indigo-600' : 'bg-gray-800'
          }`}
        >
          <Palette className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {activeTab === 'voice' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Voice Selection
            </label>
            <div className="grid gap-3">
              {voiceOptions.map((voice) => (
                <div
                  key={voice.id}
                  className={`p-3 rounded-lg ${
                    voiceId === voice.id ? 'bg-indigo-600' : 'bg-gray-800'
                  } cursor-pointer`}
                  onClick={() => setVoiceId(voice.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">{voice.name}</h4>
                      <p className="text-sm text-gray-300">{voice.style}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => previewVoice(voice.previewUrl)}
                      className="p-2 rounded-full bg-gray-700"
                    >
                      <Play className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Voice Text
            </label>
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              placeholder="Enter text for voice-over..."
              className="w-full h-32 bg-gray-800 text-white rounded-lg p-3 resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVoiceGeneration}
            disabled={isGenerating || !voiceText}
            className={`w-full py-3 rounded-lg ${
              isGenerating || !voiceText
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white font-medium`}
          >
            {isGenerating ? 'Generating...' : 'Generate Voice-over'}
          </motion.button>
        </div>
      )}

      {/* Other tabs remain the same */}
    </div>
  );
};