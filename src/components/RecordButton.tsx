import React, { useState } from 'react';
import { Video, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const RecordButton = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsRecording(!isRecording)}
      className={`fixed bottom-6 right-6 p-4 rounded-full ${
        isRecording ? 'bg-red-500' : 'bg-white'
      } shadow-lg z-50`}
    >
      {isRecording ? (
        <StopCircle className="w-8 h-8 text-white" />
      ) : (
        <Video className="w-8 h-8 text-gray-900" />
      )}
    </motion.button>
  );
};