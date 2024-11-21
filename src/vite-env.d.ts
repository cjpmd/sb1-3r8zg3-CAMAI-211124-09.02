/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_TIKTOK_CLIENT_KEY: string
  readonly VITE_INSTAGRAM_CLIENT_ID: string
  readonly VITE_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}