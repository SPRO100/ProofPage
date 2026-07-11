import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { getLimits, canAddProject } from '@/lib/auth/entitlements'
import type { Plan } from '@/types/database'

// GET /api/entitlements
// Returns the authenticated user's plan limits and current usage.
// Used by dashboard UI to show/hide upgrade prompts and gate actions.
export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const plan = profile.plan as Plan

  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  const limits = getLimits(plan)
  const currentCount = projectCount ?? 0

  return NextResponse.json({
    plan,
    limits,
    usage: {
      projects: currentCount,
    },
    can: {
      addProject: canAddProject(plan, currentCount),
      useProThemes: limits.canUseProThemes,
      verifyRevenue: limits.canVerifyRevenue,
      connectProviders: limits.canConnectProviders,
    },
  })
}
