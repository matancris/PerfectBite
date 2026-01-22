/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PAYMENT_PROVIDER: 'stripe' | 'tranzila' | 'payplus' | 'mock'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
