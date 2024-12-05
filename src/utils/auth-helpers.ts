import { AuthError } from '@supabase/supabase-js';
import { toast } from '../components/ui/use-toast';

export const handleAuthError = (error: AuthError | Error | unknown) => {
  let message = 'An unexpected error occurred';
  let status = 500;

  if (error instanceof AuthError) {
    message = error.message;
    status = error.status || 500;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast({
    title: 'Authentication Error',
    description: message,
    variant: 'destructive',
  });

  return { message, status };
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const formatAuthErrorMessage = (error: AuthError | Error | unknown): string => {
  if (isAuthError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
