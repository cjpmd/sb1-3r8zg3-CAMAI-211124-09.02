import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'  // Using the latest API version
});

console.log('Testing Stripe connection...');

try {
  const account = await stripe.accounts.retrieve();
  console.log('Successfully connected to Stripe!');
  console.log('Account:', {
    id: account.id,
    type: account.type,
    email: account.email
  });
} catch (error) {
  console.error('Stripe connection error:', {
    type: error.type,
    message: error.message,
    code: error.code
  });
  
  if (error.raw) {
    console.error('Raw error:', error.raw);
  }
}
