import express from 'express';
import { StripeController } from '../controllers/stripe.controller.js';

const router = express.Router();
const stripeController = new StripeController();

// Create a checkout session
router.post('/create-checkout', express.json(), stripeController.createCheckoutSession);

// Handle webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Create customer portal session
router.post('/portal/create-session', express.json(), stripeController.createPortalSession);

export default router;
