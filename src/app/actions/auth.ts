'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string>
}

// ─── Sign up ─────────────────────────────────────────────────────────────────

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const fieldErrors: Record<string, string> = {}
  if (!email) fieldErrors.email = 'Email is required'
  if (password.length < 8) fieldErrors.password = 'Password must be at least 8 characters'
  if (Object.keys(fieldErrors).length) return { fieldErrors }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { fieldErrors: { email: 'An account with this email already exists' } }
    }
    return { error: error.message }
  }

  // Trigger is run server-side (creates profile stub).
  // Send new user to onboarding to claim their username.
  redirect('/onboarding')
}

// ─── Sign in ─────────────────────────────────────────────────────────────────

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  // Sanitise redirectTo — only allow internal paths to prevent open-redirect attacks
  const rawRedirect = String(formData.get('redirectTo') ?? '')
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard'

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Supabase returns "Invalid login credentials" for both wrong email and wrong password.
    return { error: 'Incorrect email or password' }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
