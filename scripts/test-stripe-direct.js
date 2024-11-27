import Stripe from 'stripe';

const STRIPE_SECRET_KEY = 'sk_test_51QNG0aRq03ZUAVwgQAkc2l9PXGCKY99I63Cf7InEgkKi7gj4Q6fuEh7V3bhTcNFFsDEyYlErgmjYU6n5pj8QckkH00YxtsMNwv';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

async function testStripeConnection() {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('Successfully connected to Stripe account:', account.id);
    
    // Test retrieving prices
    const prices = await stripe.prices.list({
      limit: 4,
      active: true
    });
    
    console.log('\nActive prices:');
    prices.data.forEach(price => {
      console.log(`${price.id}: ${price.unit_amount/100} ${price.currency.toUpperCase()} per ${price.recurring.interval}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStripeConnection();
