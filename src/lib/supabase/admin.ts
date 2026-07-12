import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { normalizeSupabaseUrl } from './config'

// Service-role client — bypasses RLS.
// ONLY use in Route Handlers that require elevated access:
// - billing webhook handler
// - revenue sync cron job
// - profile creation trigger fallback
//
// Never import this in Client Components or expose to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured')
  }

  return createClient(normalizeSupabaseUrl(url), serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
