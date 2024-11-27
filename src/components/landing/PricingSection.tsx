import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (priceId: string) => void;
}

const plans = [
  {
    name: 'Basic',
    price: 9,
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
    features: [
      '720p video quality',
      '30 videos per month',
      'Basic filters',
      'Community support'
    ]
  },
  {
    name: 'Pro',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: [
      '1080p video quality',
      'Unlimited videos',
      'Advanced filters',
      'Priority support',
      'Analytics dashboard'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      '4K video quality',
      'Unlimited everything',
      'Custom filters',
      '24/7 support',
      'Advanced analytics',
      'API access'
    ]
  }
];

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <div className="py-24 bg-gradient-to-b from-black to-gray-900" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-gray-300"
          >
            Select the perfect plan for your creative needs
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl flex flex-col ${
                plan.popular ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 transform">
                  <span className="inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-4 flex items-baseline text-white">
                  <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex text-base text-gray-300">
                      <Check className="h-6 w-6 text-indigo-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                onClick={() => onSelectPlan(plan.priceId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Choose {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};