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

  const projectList = projects ?? []

  let publicProjects: PublicProject[] = projectList.map((p) => ({ ...p, revenue: null }))

  if (projectList.length > 0) {
    const projectIds = projectList.map((p) => p.id)

    // Fetch latest metric per project in one query using a window function via RPC,
    // or fall back to a simple query sorted by recorded_at and dedup in JS.
    const { data: allMetrics } = await supabase
      .from('revenue_metrics')
      .select('*')
      .in('project_id', projectIds)
      .order('recorded_at', { ascending: false })

    // Keep only the latest metric per project
    const latestMetricByProject = new Map<string, RevenueMetric>()
    for (const m of (allMetrics ?? []) as RevenueMetric[]) {
      if (!latestMetricByProject.has(m.project_id)) {
        latestMetricByProject.set(m.project_id, m)
      }
    }

    // Fetch all relevant revenue sources in one query
    const sourceIds = [...latestMetricByProject.values()]
      .map((m) => m.source_id)
      .filter((id): id is string => id !== null)

    const sourceById = new Map<string, RevenueSource>()
    if (sourceIds.length > 0) {
      const { data: sources } = await supabase
        .from('revenue_sources')
        .select('*')
        .in('id', sourceIds)

      for (const s of (sources ?? []) as RevenueSource[]) {
        sourceById.set(s.id, s)
      }
    }

    publicProjects = projectList.map((project) => {
      const metric = latestMetricByProject.get(project.id) ?? null
      const source = metric?.source_id ? (sourceById.get(metric.source_id) ?? null) : null
      return {
        ...project,
        revenue: buildRevenueDisplay(metric, source),
      }
    })
  }

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
  createClient().then((supabase) => {
    const referrer = request.headers.get('referer') ?? null
    const ua = request.headers.get('user-agent') ?? null

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
