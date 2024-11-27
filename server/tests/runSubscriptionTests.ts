import { StripeTestHelper } from './stripeTestUtils';
import dotenv from 'dotenv';

dotenv.config();

async function runSubscriptionTests() {
  const testHelper = StripeTestHelper.getInstance();
  let testCustomerId: string | undefined;

  try {
    console.log('🏁 Starting subscription tests...\n');

    // Test 1: Create subscription with successful payment
    console.log('Test 1: Creating subscription with successful payment');
    const { subscription, customer } = await testHelper.createTestSubscription({
      customer: {
        email: 'test.success@example.com',
        card: 'success',
        name: 'Test Success User',
      },
      priceId: process.env.VITE_STRIPE_PRO_PRICE_ID_MONTHLY!,
    });
    testCustomerId = customer.id;
    console.log('✅ Subscription created successfully\n');

    // Test 2: Update subscription
    console.log('Test 2: Updating subscription to yearly plan');
    await testHelper.simulateSubscriptionUpdate(
      subscription.id,
      process.env.VITE_STRIPE_PRO_PRICE_ID_YEARLY!
    );
    console.log('✅ Subscription updated successfully\n');

    // Test 3: Create subscription with 3D Secure card
    console.log('Test 3: Testing 3D Secure payment');
    await testHelper.createTestSubscription({
      customer: {
        email: 'test.3ds@example.com',
        card: 'threeDSecure',
        name: 'Test 3DS User',
      },
      priceId: process.env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY!,
    });
    console.log('✅ 3D Secure payment handled successfully\n');

    // Test 4: Create subscription with declined card
    console.log('Test 4: Testing declined payment');
    try {
      await testHelper.createTestSubscription({
        customer: {
          email: 'test.decline@example.com',
          card: 'decline',
          name: 'Test Decline User',
        },
        priceId: process.env.VITE_STRIPE_BASIC_PRICE_ID_MONTHLY!,
      });
    } catch (error) {
      console.log('✅ Declined payment handled correctly\n');
    }

    // Test 5: Cancel subscription
    console.log('Test 5: Testing subscription cancellation');
    await testHelper.simulateSubscriptionCancellation(subscription.id);
    console.log('✅ Subscription cancelled successfully\n');

    // Test 6: Verify database state
    if (testCustomerId) {
      console.log('Test 6: Verifying database state');
      const dbState = await testHelper.verifyDatabaseState(testCustomerId);
      console.log('Database state:', JSON.stringify(dbState, null, 2));
      console.log('✅ Database state verified\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    if (testCustomerId) {
      console.log('🧹 Cleaning up test data...');
      await testHelper.cleanupTestData(testCustomerId);
      console.log('✅ Test data cleaned up');
    }
  }
}

// Run the tests
runSubscriptionTests().catch(console.error);
