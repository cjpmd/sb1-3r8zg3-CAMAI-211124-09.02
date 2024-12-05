/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_STRIPE_BASIC_PRICE_ID_MONTHLY: string
  readonly VITE_STRIPE_BASIC_PRICE_ID_YEARLY: string
  readonly VITE_STRIPE_PRO_PRICE_ID_MONTHLY: string
  readonly VITE_STRIPE_PRO_PRICE_ID_YEARLY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_TIKTOK_CLIENT_KEY: string
  readonly VITE_TIKTOK_CLIENT_SECRET: string
  readonly VITE_TIKTOK_REDIRECT_URI: string
  readonly VITE_YOUTUBE_CLIENT_ID: string
  readonly VITE_FACEBOOK_CLIENT_ID: string
  readonly VITE_TWITTER_CLIENT_ID: string
  readonly MODE: 'development' | 'production'
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
