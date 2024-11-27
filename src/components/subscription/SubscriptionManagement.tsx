import React, { useState } from 'react';
import { createCheckoutSession, getPriceId } from '@/lib/stripe';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: {
      monthly: 9.99,
      yearly: 99.90,
    },
    features: [
      'Basic features',
      'Limited storage',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: {
      monthly: 19.99,
      yearly: 199.90,
    },
    features: [
      'All Basic features',
      'Unlimited storage',
      'Priority support',
      'Advanced analytics',
    ],
  },
];

export function SubscriptionManagement() {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting subscription process:', { planId, billingInterval });

      const priceId = getPriceId(planId, billingInterval);
      
      await createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
      });
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold sm:text-center">
            Pricing Plans
          </h1>
          <p className="mt-5 text-xl text-gray-400 sm:text-center">
            Choose the perfect plan for your needs
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-12 sm:mt-16 sm:mx-auto sm:max-w-lg">
            <div className="bg-gray-900 rounded-lg p-2 flex">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`w-1/2 py-2 text-sm font-medium rounded-md focus:outline-none ${
                  billingInterval === 'monthly'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`w-1/2 py-2 text-sm font-medium rounded-md focus:outline-none ${
                  billingInterval === 'yearly'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg divide-y divide-gray-800 ${
                selectedPlan === plan.id
                  ? 'border-2 border-indigo-500 bg-gray-900'
                  : 'border border-gray-800 bg-gray-900'
              }`}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold">
                  {plan.name}
                </h2>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold">
                    ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-base font-medium text-gray-400">
                    /{billingInterval === 'monthly' ? 'mo' : 'year'}
                  </span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                  className={`mt-8 block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Processing...' : 'Subscribe'}
                </button>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 sm:mx-auto sm:max-w-lg">
            <div className="bg-red-900/50 border border-red-500 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
