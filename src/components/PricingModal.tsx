import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useSubscription } from '../lib/stripe';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { subscription, isLoading, createSubscription } = useSubscription();
  const stripe = useStripe();
  const elements = useElements();

  const plans = [
    {
      name: 'Basic',
      price: isYearly ? 99 : 9,
      priceId: isYearly 
        ? import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_YEARLY 
        : import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY,
      features: [
        'Up to 50 videos per month',
        'Basic editing tools',
        'Standard quality export',
        'Email support'
      ]
    },
    {
      name: 'Pro',
      price: isYearly ? 199 : 19,
      priceId: isYearly 
        ? import.meta.env.VITE_STRIPE_PRO_PRICE_ID_YEARLY 
        : import.meta.env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY,
      features: [
        'Unlimited videos',
        'Advanced editing tools',
        '4K quality export',
        'Priority support',
        'Custom branding',
        'Analytics dashboard'
      ]
    }
  ];

  const handleSubscribe = async (priceId: string) => {
    try {
      setError(null);
      await createSubscription(priceId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl bg-gray-900 rounded-xl p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isYearly ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                animate={{ x: isYearly ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly (Save 20%)
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`relative p-6 rounded-xl border-2 transition-colors ${
                selectedPlan === plan.priceId
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/{isYearly ? 'year' : 'month'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={isLoading || subscription?.status === 'active'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  subscription?.status === 'active'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : subscription?.status === 'active' ? (
                  'Current Plan'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}

        {selectedPlan && (
          <div className="mt-6 p-4 rounded-lg bg-gray-800">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#fff',
                    '::placeholder': {
                      color: '#6b7280',
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};