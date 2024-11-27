import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createOrUpdateProducts() {
  try {
    console.log('Creating Stripe products and prices...');

    // Create Basic Plan Product
    const basicProduct = await stripe.products.create({
      name: 'Basic Plan',
      description: 'Access to basic features',
    });
    console.log('\n✅ Created Basic Plan product');

    // Create Pro Plan Product
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'Access to all features',
    });
    console.log('✅ Created Pro Plan product');

    // Create prices for Basic Plan
    const basicMonthly = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    const basicYearly = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 9990, // $99.90 (2 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });

    console.log('\n✅ Created Basic Plan prices:');
    console.log('Monthly:', basicMonthly.id, '($9.99/month)');
    console.log('Yearly:', basicYearly.id, '($99.90/year)');

    // Create prices for Pro Plan
    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    const proYearly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 19990, // $199.90 (2 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });

    console.log('\n✅ Created Pro Plan prices:');
    console.log('Monthly:', proMonthly.id, '($19.99/month)');
    console.log('Yearly:', proYearly.id, '($199.90/year)');

    // Update .env.local with new price IDs
    const envContent = `VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY}

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=${process.env.VITE_STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY}

# Stripe Price IDs
VITE_STRIPE_BASIC_PRICE_ID_MONTHLY=${basicMonthly.id}
VITE_STRIPE_BASIC_PRICE_ID_YEARLY=${basicYearly.id}
VITE_STRIPE_PRO_PRICE_ID_MONTHLY=${proMonthly.id}
VITE_STRIPE_PRO_PRICE_ID_YEARLY=${proYearly.id}
`;

    writeFileSync(join(__dirname, '../.env.local'), envContent);
    console.log('\n✅ Updated .env.local with new price IDs');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createOrUpdateProducts();
