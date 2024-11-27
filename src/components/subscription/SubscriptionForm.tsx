import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface SubscriptionFormProps {
  priceId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SubscriptionForm({ priceId, onSuccess, onError }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setLoading(true);

    try {
      // Create the subscription
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const { clientSecret, subscriptionId } = await response.json();

      // Confirm the payment
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: user.email,
          },
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      toast({
        title: 'Subscription successful!',
        description: 'Your subscription has been activated.',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process subscription';
      toast({
        title: 'Subscription failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? 'Processing...' : 'Subscribe'}
      </Button>
    </form>
  );
}
