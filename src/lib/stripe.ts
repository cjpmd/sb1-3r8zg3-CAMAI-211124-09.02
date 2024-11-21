import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (priceId: string): Promise<string> => {
  const { data: { session }, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId }
  });

  if (error) throw error;
  return session.url;
};

export const createCustomerPortalSession = async (): Promise<string> => {
  const { data: { url }, error } = await supabase.functions.invoke('create-portal-session');
  
  if (error) throw error;
  return url;
};