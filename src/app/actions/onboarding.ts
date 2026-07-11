'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isUsernameAvailable } from '@/lib/auth/helpers'

export type OnboardingState = {
  error?: string
  fieldErrors?: Record<string, string>
  step?: number
}

const USERNAME_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

// Called on final "Publish ProofPage" submit.
// Receives all 4 steps worth of data in one FormData.
export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Step 1: username ──────────────────────────────────────────────────────
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const fieldErrors: Record<string, string> = {}

  if (!USERNAME_RE.test(username) || username.length < 3 || username.length > 30) {
    fieldErrors.username = '3–30 characters. Lowercase letters, numbers, and hyphens only.'
  }

  // ── Step 2: profile ───────────────────────────────────────────────────────
  const displayName = String(formData.get('display_name') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()

  if (!displayName) fieldErrors.display_name = 'Display name is required'

  // ── Step 3: project ───────────────────────────────────────────────────────
  const projectName = String(formData.get('project_name') ?? '').trim()
  const projectStatus = String(formData.get('project_status') ?? 'building')
  const projectUrl = String(formData.get('project_url') ?? '').trim()
  const projectDesc = String(formData.get('project_description') ?? '').trim()

  if (!projectName) fieldErrors.project_name = 'Project name is required'

  if (Object.keys(fieldErrors).length) return { fieldErrors }

  // ── Username availability ─────────────────────────────────────────────────
  const available = await isUsernameAvailable(username)
  if (!available) {
    return { fieldErrors: { username: 'This address is already taken. Please choose another.' } }
  }

  // ── Persist profile ───────────────────────────────────────────────────────
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username,
      display_name: displayName || null,
      location: location || null,
      bio_en: bio || null,
    })
    .eq('id', user.id)

  if (profileError) {
    if (profileError.code === '23505') {
      return { fieldErrors: { username: 'This address is already taken. Please choose another.' } }
    }
    return { error: 'Failed to save profile. Please try again.' }
  }

  // ── Persist first project ─────────────────────────────────────────────────
  const { error: projectError } = await supabase
    .from('projects')
    .insert({
      profile_id: user.id,
      name: projectName,
      description_en: projectDesc || null,
      url: projectUrl || null,
      status: projectStatus,
      sort_order: 0,
      is_public: true,
    })

  if (projectError) {
    // P0001 = free plan trigger fired (shouldn't happen in onboarding, but guard anyway)
    if (projectError.code === 'P0001') {
      return { error: 'Free plan allows only one project.' }
    }
    return { error: 'Failed to save project. Please try again.' }
  }

  redirect('/dashboard')
}

// ── Username availability check (called by client-side debounce) ─────────────
export async function checkUsername(username: string): Promise<{ available: boolean; error?: string }> {
  if (!username || username.length < 3) return { available: false }
  if (!USERNAME_RE.test(username) || username.length > 30) {
    return { available: false, error: '3–30 characters. Lowercase letters, numbers, and hyphens.' }
  }
  const available = await isUsernameAvailable(username)
  return { available }
}
