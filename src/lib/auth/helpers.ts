import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

// Returns the session user, or null if not authenticated.
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Returns the session user's profile, or null.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

// Use in Server Components / Route Handlers that require authentication.
// Redirects to /login if no session.
export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

// Use in Server Components that require authentication + an existing profile.
export async function requireProfile() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  return profile as Profile
}

// Check if a username is available (case-insensitive).
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle()

  return data === null
}

// Returns the plan for the current user, defaulting to 'free'.
export async function getCurrentPlan(): Promise<'free' | 'pro'> {
  const profile = await getProfile()
  return profile?.plan ?? 'free'
}
