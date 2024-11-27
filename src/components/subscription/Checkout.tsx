import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

export function Checkout() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const clientSecret = searchParams.get('session');

  useEffect(() => {
    if (!clientSecret) {
      navigate('/pricing');
    }
  }, [clientSecret, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
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
        title: 'Payment successful!',
        description: 'Your subscription has been activated.',
      });

      // Redirect to account or dashboard
      navigate('/account');
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Complete your subscription</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border rounded">
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
          {loading ? 'Processing...' : 'Pay now'}
        </Button>
      </form>
    </div>
  );
}
