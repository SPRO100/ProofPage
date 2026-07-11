import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildRevenueDisplay } from '@/lib/revenue/verification'
import type { PublicProfile, PublicProject, RevenueMetric, RevenueSource } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch public profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('is_public', true)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch public projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_public', true)
    .order('sort_order', { ascending: true })

  // Fetch latest revenue metric and source for each project
  const publicProjects: PublicProject[] = await Promise.all(
    (projects ?? []).map(async (project) => {
      const { data: metric } = await supabase
        .from('revenue_metrics')
        .select('*')
        .eq('project_id', project.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let source: RevenueSource | null = null
      if (metric?.source_id) {
        const { data } = await supabase
          .from('revenue_sources')
          .select('*')
          .eq('id', metric.source_id)
          .maybeSingle()
        source = data
      }

      return {
        ...project,
        revenue: buildRevenueDisplay(metric as RevenueMetric | null, source),
      }
    }),
  )

  // Record profile view (fire-and-forget — do not await)
  recordProfileView(request, profile.id)

  const response: PublicProfile = {
    ...profile,
    projects: publicProjects,
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}

function recordProfileView(request: Request, profileId: string) {
  // Run async without blocking the response
  createClient().then((supabase) => {
    const referrer = request.headers.get('referer') ?? null
    const ua = request.headers.get('user-agent') ?? null

    // Skip bots
    if (ua && /bot|crawler|spider|crawling/i.test(ua)) return

    void Promise.resolve(
      supabase.from('profile_views').insert({
        profile_id: profileId,
        referrer,
        viewer_username: null as string | null,
      }),
    )
  })
}
