'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isUsernameAvailable } from '@/lib/auth/helpers'

export type OnboardingState = {
  error?: string
  fieldErrors?: Record<string, string>
  step?: number
}

const USERNAME_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
const PROJECT_STATUSES = new Set(['active', 'paused', 'building', 'sold', 'closed'])

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
  if (!PROJECT_STATUSES.has(projectStatus)) fieldErrors.project_status = 'Invalid project status'

  if (projectUrl) {
    try {
      const parsed = new URL(projectUrl)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        fieldErrors.project_url = 'URL must start with http:// or https://'
      }
    } catch {
      fieldErrors.project_url = 'Invalid URL format'
    }
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors }

  // ── Username availability ─────────────────────────────────────────────────
  const available = await isUsernameAvailable(username)
  if (!available) {
    return { fieldErrors: { username: 'This address is already taken. Please choose another.' } }
  }

  // ── Persist profile ───────────────────────────────────────────────────────
  const profileValues = {
    username,
    display_name: displayName || null,
    location: location || null,
    bio_en: bio || null,
  }

  const { data: savedProfile, error: profileError } = await supabase
    .from('profiles')
    .update(profileValues)
    .eq('id', user.id)
    .select('id')
    .maybeSingle()

  if (profileError) {
    if (profileError.code === '23505') {
      return { fieldErrors: { username: 'This address is already taken. Please choose another.' } }
    }
    return { error: 'Failed to save profile. Please try again.' }
  }

  // The database trigger normally creates this row during signup. Recover
  // safely if an account was created while the trigger was missing/disabled.
  if (!savedProfile) {
    try {
      const admin = createAdminClient()
      const { error: recoveryError } = await admin.from('profiles').insert({
        id: user.id,
        ...profileValues,
      })

      if (recoveryError) {
        if (recoveryError.code === '23505') {
          return { fieldErrors: { username: 'This address is already taken. Please choose another.' } }
        }
        console.error('Onboarding profile recovery failed', {
          code: recoveryError.code,
          message: recoveryError.message,
        })
        return { error: 'Failed to create your profile. Please try again.' }
      }
    } catch (error) {
      console.error('Onboarding profile recovery is unavailable', error)
      return { error: 'Failed to create your profile. Please try again.' }
    }
  }

  // ── Persist first project ─────────────────────────────────────────────────
  // The authenticated server action has already verified the user JWT and all
  // submitted fields. Use the server-only admin client for this one bootstrap
  // insert so onboarding does not depend on a separately deployed RLS policy.
  // The database free-plan trigger remains the final one-project guard.
  let projectError: { code?: string; message: string } | null = null
  try {
    const admin = createAdminClient()
    const result = await admin
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
    projectError = result.error
  } catch (error) {
    console.error('Onboarding project creation is unavailable', error)
    return { error: 'Project creation is temporarily unavailable. Please try again.' }
  }

  if (projectError) {
    // P0001 = free plan trigger fired.
    if (projectError.code === 'P0001') {
      return { error: 'Free plan allows only one project.' }
    }
    console.error('Onboarding project insert failed', {
      code: projectError.code,
      message: projectError.message,
    })
    return { error: `Failed to save project (code: ${projectError.code ?? 'unknown'}). Please try again.` }
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
