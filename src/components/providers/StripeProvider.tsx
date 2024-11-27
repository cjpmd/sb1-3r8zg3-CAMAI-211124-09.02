import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { initializeStripe } from '../../lib/stripeClient';
import { Loader2 } from 'lucide-react';

// Debug logging function
const debug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[StripeProvider] ${message}`, data || '');
  }
};

// Error message helper
const getErrorDescription = (error: string): string => {
  if (error.includes('publishable key not found')) {
    return 'Payment system configuration is missing. Please contact support.';
  }
  if (error.includes('Invalid Stripe key')) {
    return 'Payment system is misconfigured. Please contact support.';
  }
  if (error.includes('Failed to load')) {
    return 'Unable to connect to payment system. Please check your internet connection.';
  }
  return 'An unexpected error occurred with the payment system.';
};

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const loadStripe = async () => {
      try {
        debug('Initializing Stripe...');
        setLoading(true);
        
        // Check if we have the required environment variables
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          throw new Error('Stripe publishable key not found');
        }

        const stripeInstance = await initializeStripe();
        
        if (!mounted) return;

        if (!stripeInstance) {
          throw new Error('Failed to initialize Stripe');
        }

        debug('Stripe initialized successfully');
        setStripe(stripeInstance);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        debug('Stripe initialization error:', errorMessage);
        
        setError(errorMessage);
        setStripe(null);
        
        toast({
          variant: 'destructive',
          title: 'Payment System Error',
          description: getErrorDescription(errorMessage),
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStripe();

    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c] text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p>Loading payment system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c] p-4 text-white">
        <div className="w-full max-w-md rounded-lg border border-gray-800 bg-[#2c2c2c] p-8 shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-red-500">Payment System Error</h2>
          <p className="mb-4">{getErrorDescription(error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return stripe ? (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c] text-white">
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-[#2c2c2c] p-8 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-yellow-500">Payment System Unavailable</h2>
        <p className="mb-4">The payment system is currently unavailable. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
