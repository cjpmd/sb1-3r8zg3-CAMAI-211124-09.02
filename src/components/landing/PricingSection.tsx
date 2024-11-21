import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { createCheckoutSession } from '../../lib/stripe';
import { useAuthStore } from '../../store/authStore';

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

export const PricingSection = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    try {
      setLoading(priceId);
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Get started with our flexible pricing options
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl ${
                plan.popular ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-400 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              )}

              <h3 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-100'}`}>
                {plan.name}
              </h3>
              
              <div className="mt-4 mb-8">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-100'}`}>
                  ${plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>
                  /month
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className={`w-5 h-5 ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`} />
                    <span className={plan.popular ? 'text-indigo-100' : 'text-gray-300'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {loading === plan.priceId ? 'Processing...' : 'Get Started'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};