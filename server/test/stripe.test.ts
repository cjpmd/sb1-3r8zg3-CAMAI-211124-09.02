import request from 'supertest';
import express from 'express';
import stripeRouter from '../stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/stripe', stripeRouter);

describe('Stripe API', () => {
  beforeAll(() => {
    // Ensure environment variables are set
    if (!process.env.STRIPE_SECRET_KEY) {
      process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    }
  });

  it('should handle create-checkout request', async () => {
    const response = await request(app)
      .post('/api/stripe/create-checkout')
      .send({
        priceId: 'price_1QO1qIRq03ZUAVwghLKambKq',
        successUrl: 'http://localhost:5173/subscription/success',
        cancelUrl: 'http://localhost:5173/subscription/cancel'
      });

    console.log('Test response:', {
      status: response.status,
      headers: response.headers,
      body: response.body,
      text: response.text,
      error: response.error
    });

    // The response should always be JSON
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toBeDefined();

    // If it's an error response, it should have error details
    if (response.status >= 400) {
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
    } else {
      expect(response.body.sessionId).toBeDefined();
    }
  });
});
