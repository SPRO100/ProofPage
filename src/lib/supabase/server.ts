import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl } from './config'

// Server-side Supabase client — use in Server Components and Route Handlers.
// Reads the session from cookies automatically.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll called from a Server Component — cookies are read-only there.
            // The middleware handles cookie refresh for Server Components.
          }
        },
      },
    },
  )
}
