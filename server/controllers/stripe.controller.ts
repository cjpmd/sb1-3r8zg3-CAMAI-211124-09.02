import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service.js';
import Stripe from 'stripe';

export class StripeController {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = StripeService.getInstance();
  }

  /**
   * Create a checkout session
   */
  public createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { priceId, successUrl, cancelUrl, customerId } = req.body;

      // Validate required fields
      if (!priceId) {
        res.status(400).json({ error: 'Missing priceId' });
        return;
      }
      if (!successUrl) {
        res.status(400).json({ error: 'Missing successUrl' });
        return;
      }
      if (!cancelUrl) {
        res.status(400).json({ error: 'Missing cancelUrl' });
        return;
      }

      // Create checkout session
      const session = await this.stripeService.createCheckoutSession({
        priceId,
        successUrl,
        cancelUrl,
        customerId,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      this.handleError(error, res);
    }
  };

  /**
   * Handle webhook events
   */
  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'];
      
      if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
        return;
      }

      const event = await this.stripeService.handleWebhookEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      res.json({ received: true, type: event.type });
    } catch (error) {
      console.error('Error in handleWebhook:', error);
      this.handleError(error, res);
    }
  };

  /**
   * Create a customer portal session
   */
  public createPortalSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { customerId, returnUrl } = req.body;

      if (!customerId) {
        res.status(400).json({ error: 'Missing customerId' });
        return;
      }
      if (!returnUrl) {
        res.status(400).json({ error: 'Missing returnUrl' });
        return;
      }

      const session = await this.stripeService.createPortalSession(
        customerId,
        returnUrl
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error in createPortalSession:', error);
      this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response): void {
    if (error instanceof Stripe.errors.StripeError) {
      res.status(400).json({
        error: 'Stripe API error',
        message: error.message,
        type: error.type,
        code: error.code,
      });
    } else {
      res.status(500).json({
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
