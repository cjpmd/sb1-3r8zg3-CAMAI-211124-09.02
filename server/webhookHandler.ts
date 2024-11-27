import { Request, Response } from 'express';
import Stripe from 'stripe';
import { webhookLogger } from './webhookLogger.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();
config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Supabase credentials are not set in environment variables');
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export async function handleWebhook(req: Request, res: Response) {
  let event: Stripe.Event;

  try {
    // For development/testing with webhook.site
    if (process.env.NODE_ENV === 'development') {
      event = req.body;
    } else {
      // For production with signature verification
      const sig = req.headers['stripe-signature'];
      if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('Missing Stripe webhook signature or secret');
      }
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }

    webhookLogger.logWebhookEvent(event);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      default:
        webhookLogger.logWebhookEvent({
          type: 'unhandled_event',
          event_type: event.type,
        });
    }

    res.json({ received: true });
  } catch (error) {
    webhookLogger.logError(error, 'webhook_handler');
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (customerError) {
      throw new Error(`Error fetching customer: ${customerError.message}`);
    }

    if (!customer) {
      throw new Error(`No customer found for Stripe customer ID: ${customerId}`);
    }

    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    };

    // Update subscriptions table
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert([
        {
          user_id: customer.user_id,
          ...subscriptionData,
        },
      ]);

    if (subscriptionError) {
      throw new Error(`Error updating subscription: ${subscriptionError.message}`);
    }

    // Update user's subscription status in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_tier: getSubscriptionTier(subscription.items.data[0].price.id),
      })
      .eq('id', customer.user_id);

    if (profileError) {
      throw new Error(`Error updating profile: ${profileError.message}`);
    }

    webhookLogger.logWebhookEvent({
      type: 'subscription_updated',
      subscription_id: subscription.id,
      user_id: customer.user_id,
      status: subscription.status,
    });
  } catch (error) {
    webhookLogger.logError(error, 'handle_subscription_change');
    throw error;
  }
}

function getSubscriptionTier(priceId: string): 'free' | 'basic' | 'pro' {
  if (!priceId) return 'free';
  
  if (priceId.startsWith('price_1OtPuG')) {
    return 'basic';
  } else if (priceId.startsWith('price_1OtPuH')) {
    return 'pro';
  }
  
  return 'free';
}
