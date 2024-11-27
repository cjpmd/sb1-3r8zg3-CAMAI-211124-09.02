import React from 'react';
import { motion } from 'framer-motion';
import { Play, CreditCard, Zap } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            Create Stunning Short Videos
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your ideas into engaging short-form content with AI-powered tools
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center space-x-2 font-medium"
            >
              <Play className="w-5 h-5" />
              <span>Get Started</span>
            </motion.button>
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center space-x-2 font-medium"
            >
              <CreditCard className="w-5 h-5" />
              <span>View Pricing</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
          >
            <Zap className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Creation</h3>
            <p className="text-gray-400">
              Create professional-quality videos with our advanced AI tools
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
          >
            <Zap className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Editing</h3>
            <p className="text-gray-400">
              Edit your videos with intelligent suggestions and automated enhancements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
          >
            <Zap className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">One-Click Share</h3>
            <p className="text-gray-400">
              Share your videos instantly across multiple platforms
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};