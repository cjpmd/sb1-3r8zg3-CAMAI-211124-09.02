import * as React from 'react';

interface SubscriptionContextType {
  subscription: any;
  isLoading: boolean;
  createSubscription: (priceId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

// Create a mock context for development
const SubscriptionContext = React.createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: false,
  createSubscription: async () => {
    console.log('Stripe not configured: createSubscription is a no-op');
  },
  cancelSubscription: async () => {
    console.log('Stripe not configured: cancelSubscription is a no-op');
  },
});

export function useSubscription() {
  return React.useContext(SubscriptionContext);
}

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  return <>{children}</>;
}

// Export these as no-op functions for development
export const createCheckoutSession = async (): Promise<string> => {
  console.log('Stripe not configured: createCheckoutSession is a no-op');
  return '';
};

export const createCustomerPortalSession = async (): Promise<string> => {
  console.log('Stripe not configured: createCustomerPortalSession is a no-op');
  return '';
};