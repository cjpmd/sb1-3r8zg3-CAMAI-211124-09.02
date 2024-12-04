import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env and .env.local
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

// Load .env first
dotenv.config({ path: envPath });

// Then load .env.local if it exists (it will override .env values)
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// Debug endpoint to check Stripe configuration
router.get('/config', (req, res) => {
  res.json({
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeVersion: stripe.getApiField('version'),
  });
});

router.post('/create-checkout', async (req, res) => {
  try {
    console.log('Received checkout request:', req.body);
    
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      const error = {
        error: 'Missing required fields',
        message: 'priceId, successUrl, and cancelUrl are required',
        details: {
          hasPriceId: !!priceId,
          hasSuccessUrl: !!successUrl,
          hasCancelUrl: !!cancelUrl,
        }
      };
      console.error('Validation error:', error);
      return res.status(400).json(error);
    }

    try {
      // Verify the price exists
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active) {
        return res.status(400).json({
          error: 'Invalid price',
          message: 'The selected price is not active',
        });
      }

      console.log('Creating Stripe session...');
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      console.log('Session created successfully:', {
        id: session.id,
        url: session.url,
      });

      return res.status(200).json({ sessionId: session.id });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return res.status(400).json({
        error: 'Stripe API error',
        message: stripeError instanceof Error ? stripeError.message : 'Failed to create Stripe session',
      });
    }
  } catch (error) {
    console.error('Server error in create-checkout:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
      } : undefined,
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export default router;
