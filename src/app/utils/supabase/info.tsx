// Supabase config sourced from Vite env vars at build time.
// Local dev reads .env.local; production reads vars set in the
// Cloudflare Pages dashboard. The publishable key is safe to ship.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

// Project ref is the subdomain of supabase.co — derive it from the URL so
// downstream code (Edge Function URLs) doesn't need a second env var.
export const projectId = supabaseUrl
  .replace(/^https?:\/\//, '')
  .replace(/\.supabase\.co.*$/, '')

export const publicAnonKey = publishableKey
