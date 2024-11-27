import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../ui/use-toast';
import { createStripeCheckoutSession } from '../../lib/stripe';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceIds: {
    monthly: string;
    yearly: string;
  };
  features: PlanFeature[];
  description: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Basic',
    price: {
      monthly: 9,
      yearly: 99,
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_YEARLY,
    },
    description: 'Perfect for getting started with content creation',
    features: [
      { name: 'Up to 50 videos per month', included: true },
      { name: 'Basic editing tools', included: true },
      { name: 'Standard quality export', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced editing tools', included: false },
      { name: '4K quality export', included: false },
      { name: 'Custom branding', included: false },
      { name: 'Analytics dashboard', included: false },
    ],
  },
  {
    name: 'Pro',
    price: {
      monthly: 19,
      yearly: 199,
    },
    priceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_PRO_PRICE_ID_YEARLY,
    },
    description: 'For professional content creators who need more',
    features: [
      { name: 'Unlimited videos', included: true },
      { name: 'Basic editing tools', included: true },
      { name: 'Standard quality export', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced editing tools', included: true },
      { name: '4K quality export', included: true },
      { name: 'Custom branding', included: true },
      { name: 'Analytics dashboard', included: true },
    ],
  },
];

export function PricingPlans() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to subscribe to a plan',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      const priceId = plan.priceIds[billingInterval];
      console.log('Creating subscription with:', {
        priceId,
        userId: user.id,
        email: user.email,
        billingInterval,
      });

      const { url } = await createStripeCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
      });

      if (!url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="relative bg-white rounded-lg p-0.5 flex">
            <button
              type="button"
              className={`relative py-2 px-6 rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto
                ${billingInterval === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-gray-700'}`}
              onClick={() => setBillingInterval('monthly')}
            >
              Monthly billing
            </button>
            <button
              type="button"
              className={`ml-0.5 relative py-2 px-6 rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto
                ${billingInterval === 'yearly'
                  ? 'bg-primary text-white'
                  : 'text-gray-700'}`}
              onClick={() => setBillingInterval('yearly')}
            >
              Yearly billing
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold">
                    ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-gray-600">
                    /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className="mt-8 w-full"
                >
                  Subscribe to {plan.name}
                </Button>
              </div>
              <div className="px-6 pt-6 pb-8 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                  What's included:
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.name}
                      className="flex space-x-3"
                    >
                      <span className={feature.included ? 'text-green-500' : 'text-gray-400'}>
                        {feature.included ? '✓' : '×'}
                      </span>
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
