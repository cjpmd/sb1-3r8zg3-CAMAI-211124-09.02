import Stripe from 'stripe';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '../../.env.local') });

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe;

  private constructor() {
    this.stripe = stripe;
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Verify Stripe connection and configuration
   */
  public async verifyConnection(): Promise<void> {
    try {
      const account = await this.stripe.accounts.retrieve();
      console.log('Successfully connected to Stripe account:', account.id);
    } catch (error) {
      console.error('Failed to connect to Stripe:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  public async createCheckoutSession(params: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
  }): Promise<Stripe.Checkout.Session> {
    const { priceId, successUrl, cancelUrl, customerId } = params;

    try {
      // Verify price exists and is active
      const price = await this.stripe.prices.retrieve(priceId);
      if (!price.active) {
        throw new Error(`Price ${priceId} is not active`);
      }

      // Create checkout session
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      };

      // Add customer if provided
      if (customerId) {
        sessionConfig.customer = customerId;
      }

      const session = await this.stripe.checkout.sessions.create(sessionConfig);
      console.log('Created checkout session:', session.id);
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  public async handleWebhookEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string
  ): Promise<{ type: string; data: any }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      console.log('Processing webhook event:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
      }

      return { type: event.type, data: event.data.object };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Create a customer portal session
   */
  public async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      console.log('Created portal session:', session.id);
      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw this.handleStripeError(error);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    // Implement checkout completion logic
    console.log('Checkout completed:', session.id);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Implement subscription update logic
    console.log('Subscription updated:', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Implement subscription deletion logic
    console.log('Subscription deleted:', subscription.id);
  }

  private handleStripeError(error: unknown): Error {
    if (error instanceof Stripe.errors.StripeError) {
      return new Error(`Stripe error: ${error.type} - ${error.message}`);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}
