/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_ENV: 'development' | 'production' | 'test'
  
  // Social Media Platform Keys
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_FACEBOOK_APP_SECRET: string
  readonly VITE_TWITTER_API_KEY: string
  readonly VITE_TWITTER_API_SECRET: string
  readonly VITE_INSTAGRAM_CLIENT_ID: string
  readonly VITE_INSTAGRAM_CLIENT_SECRET: string
  readonly VITE_YOUTUBE_API_KEY: string
  readonly VITE_TIKTOK_CLIENT_KEY: string
  readonly VITE_TIKTOK_CLIENT_SECRET: string
  
  // Database Configuration
  readonly VITE_DB_HOST: string
  readonly VITE_DB_PORT: string
  readonly VITE_DB_NAME: string
  readonly VITE_DB_USER: string
  readonly VITE_DB_PASSWORD: string
  
  // Security
  readonly VITE_JWT_SECRET: string
  readonly VITE_ENCRYPTION_KEY: string
  
  // Feature Flags
  readonly VITE_ENABLE_SOCIAL_LOGIN: string
  readonly VITE_ENABLE_AI_FEATURES: string
  readonly VITE_ENABLE_ANALYTICS: string
  
  // Monitoring
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ANALYTICS_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Make environment variables available on window
declare global {
  interface Window {
    env: ImportMetaEnv
  }
}
