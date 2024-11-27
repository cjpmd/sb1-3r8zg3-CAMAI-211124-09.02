import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log('Attempting to initialize Stripe with key:', key ? 'present' : 'missing');
    
    if (!key) {
      console.error('Stripe publishable key not found in environment variables');
      return Promise.reject(new Error('Stripe publishable key not found'));
    }

    // Clean and validate the key
    const cleanKey = key.trim();
    if (!cleanKey.startsWith('pk_')) {
      console.error('Invalid Stripe publishable key format');
      return Promise.reject(new Error('Invalid Stripe key format'));
    }

    console.log('Loading Stripe script...');
    stripePromise = loadStripe(cleanKey, {
      stripeAccount: undefined, // Add if using Connect
      apiVersion: '2023-10-16', // Use latest API version
      locale: 'en', // Set default locale
    }).catch(error => {
      console.error('Error loading Stripe:', error);
      stripePromise = null; // Reset promise on error
      return null;
    });
  }
  return stripePromise;
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeStripe = async (): Promise<Stripe | null> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Stripe initialization attempt ${retries + 1}/${MAX_RETRIES}`);
      
      // Reset stripePromise if it previously failed
      if (retries > 0) {
        stripePromise = null;
      }

      const stripe = await getStripe();
      if (stripe) {
        console.log('Stripe initialized successfully');
        return stripe;
      }
      throw new Error('Failed to initialize Stripe');
    } catch (error) {
      console.error('Stripe initialization error:', error);
      retries++;
      
      if (retries === MAX_RETRIES) {
        console.error('Failed to initialize Stripe after maximum retries');
        throw new Error('Failed to initialize Stripe after maximum retries');
      }
      
      console.warn(`Retry ${retries}/${MAX_RETRIES} initializing Stripe...`);
      await wait(RETRY_DELAY * retries);
    }
  }
  
  return null;
};

// Helper function to handle network errors
export const handleStripeNetworkError = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt}/${retries} failed:`, lastError);
      
      if (attempt === retries) {
        throw lastError;
      }
      
      await wait(RETRY_DELAY * attempt);
    }
  }
  
  throw lastError!;
};

export default getStripe;
