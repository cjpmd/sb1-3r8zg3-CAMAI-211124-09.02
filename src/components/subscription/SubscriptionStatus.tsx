import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription/status/${user?.id}`);
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: 'Error',
        description: 'Failed to open subscription management portal',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">No active subscription</h2>
        <Button onClick={() => navigate('/pricing')}>View Plans</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Subscription Status</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-medium">
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Renewal Date</p>
          <p className="font-medium">
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        </div>
        {subscription.cancel_at_period_end && (
          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-800">
              Your subscription will end on{' '}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
        )}
        <Button
          onClick={handleManageSubscription}
          className="w-full mt-6"
        >
          Manage Subscription
        </Button>
      </div>
    </div>
  );
}
