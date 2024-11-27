import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/')}
      className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-white"
      aria-label="Back to Dashboard"
    >
      <ArrowLeft className="w-6 h-6" />
      <span>Back</span>
    </motion.button>
  );
};
