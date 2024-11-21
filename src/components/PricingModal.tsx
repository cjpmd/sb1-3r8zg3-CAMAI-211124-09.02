import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingTier = ({ name, price, features, popular }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-6 rounded-2xl ${
      popular ? 'bg-indigo-600' : 'bg-gray-800'
    } relative`}
  >
    {popular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-400 text-white px-3 py-1 rounded-full text-sm">
        Most Popular
      </span>
    )}
    <h3 className={`text-xl font-bold ${popular ? 'text-white' : 'text-gray-100'}`}>
      {name}
    </h3>
    <div className="mt-4 mb-6">
      <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-gray-100'}`}>
        ${price}
      </span>
      <span className={`text-sm ${popular ? 'text-indigo-200' : 'text-gray-400'}`}>
        /month
      </span>
    </div>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center space-x-3">
          <Check className={`w-5 h-5 ${popular ? 'text-indigo-200' : 'text-gray-400'}`} />
          <span className={popular ? 'text-indigo-100' : 'text-gray-300'}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
    <button
      className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold ${
        popular
          ? 'bg-white text-indigo-600 hover:bg-gray-100'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      } transition-colors`}
    >
      Get Started
    </button>
  </motion.div>
);

export const PricingModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
  >
    <div className="bg-gray-900 p-8 rounded-3xl max-w-5xl w-full relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </motion.button>

      <h2 className="text-3xl font-bold text-white text-center mb-2">
        Choose Your Plan
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Get started with our flexible pricing options
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        <PricingTier
          name="Basic"
          price={9}
          features={[
            '720p video quality',
            '30 videos per month',
            'Basic filters',
            'Community support'
          ]}
          popular={false}
        />
        <PricingTier
          name="Pro"
          price={19}
          features={[
            '1080p video quality',
            'Unlimited videos',
            'Advanced filters',
            'Priority support',
            'Analytics dashboard'
          ]}
          popular={true}
        />
        <PricingTier
          name="Enterprise"
          price={49}
          features={[
            '4K video quality',
            'Unlimited everything',
            'Custom filters',
            '24/7 support',
            'Advanced analytics',
            'API access'
          ]}
          popular={false}
        />
      </div>
    </div>
  </motion.div>
);