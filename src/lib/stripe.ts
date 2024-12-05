import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { handleStripeNetworkError, initializeStripe } from './stripeClient';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

interface Subscription {
  id: string;
  status: string;
  price_id: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
  current_period_start: string;
}

interface SubscriptionResponse {
  subscription: Subscription | null;
}

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface StripeError {
  error: string;
  message: string;
  type?: string;
  code?: string;
}

// Update API base URL to use Vite's proxy
const API_BASE_URL = '/api';

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const handleApiError = async (response: Response): Promise<never> => {
    const data: StripeError = await response.json();
    const errorMessage = data.message || data.error || 'An unexpected error occurred';
    throw new Error(errorMessage);
  };

  const fetchSubscription = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await handleStripeNetworkError(async () => 
        fetch(`${API_BASE_URL}/stripe/subscription/${user.id}`)
      );
      
      if (!response.ok) {
        await handleApiError(response);
      }

      const data: SubscriptionResponse = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
      setError(errorMessage);
      console.error('Subscription fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscription = async (priceId: string) => {
    if (!user?.id || !user?.email) {
      throw new Error('User must be logged in to create a subscription');
    }

    try {
      const response = await handleStripeNetworkError(async () =>
        fetch(`${API_BASE_URL}/stripe/create-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId: user.id,
            email: user.email,
          }),
        })
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      await fetchSubscription();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      console.error('Subscription creation error:', err);
      throw err;
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await handleStripeNetworkError(async () =>
        fetch(`${API_BASE_URL}/stripe/cancel-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscriptionId }),
        })
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      await fetchSubscription();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      console.error('Subscription cancellation error:', err);
      throw err;
    }
  };

  const createPortalSession = async () => {
    if (!user?.id) {
      throw new Error('User must be logged in to access the billing portal');
    }

    try {
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      const response = await handleStripeNetworkError(async () =>
        fetch(`${API_BASE_URL}/stripe/portal/create-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: user.id,
            returnUrl: window.location.origin + '/account',
          }),
        })
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No portal URL returned from server');
      }

      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create portal session';
      setError(errorMessage);
      console.error('Portal session creation error:', err);
      throw err;
    }
  };

  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    cancelSubscription,
    createPortalSession,
  };
}

export interface CheckoutOptions {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(options: CheckoutOptions) {
  try {
    console.log('Creating checkout session:', options);
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Network error',
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    if (!data.sessionId) {
      throw new Error('No session ID returned from server');
    }

    return data.sessionId;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
}

export const getPriceId = (plan: string, interval: string): string => {
  const priceIds = {
    basic: {
      monthly: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID_YEARLY,
    },
    pro: {
      monthly: import.meta.env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY,
      yearly: import.meta.env.VITE_STRIPE_PRO_PRICE_ID_YEARLY,
    },
  };

  const selectedPrice = priceIds[plan as keyof typeof priceIds]?.[interval as 'monthly' | 'yearly'];

  if (!selectedPrice) {
    throw new Error(`Invalid plan (${plan}) or interval (${interval})`);
  }

  return selectedPrice;
};
