import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { StripeProvider } from '../StripeProvider';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '../../ui/use-toast';

// Mock the modules
jest.mock('@stripe/stripe-js');
jest.mock('../../ui/use-toast');

describe('StripeProvider', () => {
  const mockToast = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('shows loading state initially', () => {
    (loadStripe as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(
      <StripeProvider>
        <div>Test Child</div>
      </StripeProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state when Stripe key is missing', async () => {
    // Clear the environment variable
    const originalEnv = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    delete process.env.VITE_STRIPE_PUBLISHABLE_KEY;

    render(
      <StripeProvider>
        <div>Test Child</div>
      </StripeProvider>
    );

    expect(screen.getByText('Payment System Unavailable')).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive',
      title: 'Configuration Error'
    }));

    // Restore the environment variable
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = originalEnv;
  });

  it('shows error state when Stripe initialization fails', async () => {
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'test_key';
    (loadStripe as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    render(
      <StripeProvider>
        <div>Test Child</div>
      </StripeProvider>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        variant: 'destructive',
        title: 'Initialization Error'
      }));
    });
  });

  it('renders children when Stripe loads successfully', async () => {
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'test_key';
    (loadStripe as jest.Mock).mockResolvedValue({ type: 'stripe' });

    render(
      <StripeProvider>
        <div>Test Child</div>
      </StripeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });
});
