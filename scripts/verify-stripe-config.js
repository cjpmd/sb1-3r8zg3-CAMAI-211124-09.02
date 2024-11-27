// This script verifies your Stripe configuration and price IDs
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../.env.local');
const envConfig = dotenv.parse(readFileSync(envPath));

const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

async function verifyStripeConfig() {
  try {
    // Verify Stripe connection
    const account = await stripe.accounts.retrieve();
    console.log('\n✅ Successfully connected to Stripe account:', account.id);
    console.log('Account name:', account.business_profile?.name || 'N/A');
    console.log('Mode:', envConfig.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE');

    // Verify Basic Plan prices
    const basicMonthly = await stripe.prices.retrieve(envConfig.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY);
    const basicYearly = await stripe.prices.retrieve(envConfig.VITE_STRIPE_BASIC_PRICE_ID_YEARLY);
    
    console.log('\nBasic Plan Prices:');
    console.log('Monthly:', {
      id: basicMonthly.id,
      active: basicMonthly.active,
      amount: basicMonthly.unit_amount / 100,
      currency: basicMonthly.currency,
      interval: basicMonthly.recurring.interval
    });
    console.log('Yearly:', {
      id: basicYearly.id,
      active: basicYearly.active,
      amount: basicYearly.unit_amount / 100,
      currency: basicYearly.currency,
      interval: basicYearly.recurring.interval
    });

    // Verify Pro Plan prices
    const proMonthly = await stripe.prices.retrieve(envConfig.VITE_STRIPE_PRO_PRICE_ID_MONTHLY);
    const proYearly = await stripe.prices.retrieve(envConfig.VITE_STRIPE_PRO_PRICE_ID_YEARLY);
    
    console.log('\nPro Plan Prices:');
    console.log('Monthly:', {
      id: proMonthly.id,
      active: proMonthly.active,
      amount: proMonthly.unit_amount / 100,
      currency: proMonthly.currency,
      interval: proMonthly.recurring.interval
    });
    console.log('Yearly:', {
      id: proYearly.id,
      active: proYearly.active,
      amount: proYearly.unit_amount / 100,
      currency: proYearly.currency,
      interval: proYearly.recurring.interval
    });

    console.log('\n✅ All price IDs verified successfully');
  } catch (error) {
    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n❌ Invalid price ID:', error.message);
      console.log('\nTip: Run setup-stripe-products.js to create new products and prices');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
}

verifyStripeConfig();
