// Debug utility functions
export const debugLog = {
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error('[ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug('[DEBUG]', ...args);
    }
  }
};

export const setupDebugListeners = () => {
  // Listen for auth state changes
  window.addEventListener('load', () => {
    debugLog.info('Window loaded');
    debugLog.info('Environment variables:', {
      SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      HAS_SUPABASE_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
  });

  // Track React rendering
  const originalError = console.error;
  console.error = (...args) => {
    // Log the error with a stack trace
    console.trace('Error occurred:');
    originalError.apply(console, args);
  };

  // Track React suspense boundaries
  window.addEventListener('unhandledrejection', (event) => {
    debugLog.error('Unhandled promise rejection:', event.reason);
  });
};

// Export a function to check the environment
export const checkEnvironment = () => {
  const env = {
    NODE_ENV: import.meta.env.MODE,
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    HAS_SUPABASE_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  debugLog.info('Environment check:', env);
  return env;
};
