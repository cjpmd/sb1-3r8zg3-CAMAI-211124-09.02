import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

async function testStripeConnection() {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('Successfully connected to Stripe account:', account.id);
  } catch (error) {
    console.error('Error:', error.message);
    console.log('API Key used:', process.env.STRIPE_SECRET_KEY);
  }
}

testStripeConnection();
