import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl } from './config'

// Browser-side Supabase client — safe to use in Client Components.
// Uses the anon key; RLS enforces access control.
export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
