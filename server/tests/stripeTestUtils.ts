import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { webhookLogger } from '../webhookLogger';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000009995',
  threeDSecure: '4000000000003220',
  insufficientFunds: '4000000000009995',
  expiredCard: '4000000000000069',
} as const;

interface TestCustomer {
  email: string;
  card: keyof typeof TEST_CARDS;
  name?: string;
}

interface TestSubscription {
  priceId: string;
  customer: TestCustomer;
  paymentMethod?: string;
}

export class StripeTestHelper {
  private static instance: StripeTestHelper;

  private constructor() {}

  static getInstance(): StripeTestHelper {
    if (!this.instance) {
      this.instance = new StripeTestHelper();
    }
    return this.instance;
  }

  async createTestCustomer(customerData: TestCustomer) {
    try {
      // Create a payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: TEST_CARDS[customerData.card],
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      // Create a customer
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        payment_method: paymentMethod.id,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      webhookLogger.logWebhookEvent({
        type: 'test_customer_created',
        customerId: customer.id,
        email: customerData.email,
      });

      return { customer, paymentMethod };
    } catch (error) {
      webhookLogger.logError(error, 'create_test_customer');
      throw error;
    }
  }

  async createTestSubscription(data: TestSubscription) {
    try {
      const { customer, paymentMethod } = await this.createTestCustomer(data.customer);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: data.priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      webhookLogger.logWebhookEvent({
        type: 'test_subscription_created',
        subscriptionId: subscription.id,
        customerId: customer.id,
      });

      return { subscription, customer, paymentMethod };
    } catch (error) {
      webhookLogger.logError(error, 'create_test_subscription');
      throw error;
    }
  }

  async simulateSubscriptionUpdate(subscriptionId: string, newPriceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
      });

      webhookLogger.logWebhookEvent({
        type: 'test_subscription_updated',
        subscriptionId,
        newPriceId,
      });

      return updatedSubscription;
    } catch (error) {
      webhookLogger.logError(error, 'simulate_subscription_update');
      throw error;
    }
  }

  async simulateSubscriptionCancellation(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.del(subscriptionId);

      webhookLogger.logWebhookEvent({
        type: 'test_subscription_cancelled',
        subscriptionId,
      });

      return subscription;
    } catch (error) {
      webhookLogger.logError(error, 'simulate_subscription_cancellation');
      throw error;
    }
  }

  async cleanupTestData(customerId: string) {
    try {
      // Delete subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });
      
      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.del(subscription.id);
      }

      // Delete customer
      await stripe.customers.del(customerId);

      webhookLogger.logWebhookEvent({
        type: 'test_data_cleaned',
        customerId,
      });
    } catch (error) {
      webhookLogger.logError(error, 'cleanup_test_data');
      throw error;
    }
  }

  async verifyDatabaseState(userId: string) {
    try {
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier')
        .eq('id', userId)
        .single();

      return {
        subscription: subscriptionData,
        profile: profileData,
      };
    } catch (error) {
      webhookLogger.logError(error, 'verify_database_state');
      throw error;
    }
  }
}
