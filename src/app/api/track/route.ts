import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ClickTarget } from '@/types/database'

// POST /api/track
// Body: { project_id: string; target: ClickTarget }
// Records a click on a public project card (url or revenue).
export async function POST(request: Request) {
  let body: { project_id?: string; target?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { project_id, target } = body

  if (!project_id || !target) {
    return NextResponse.json({ error: 'project_id and target are required' }, { status: 400 })
  }

  if (target !== 'url' && target !== 'revenue') {
    return NextResponse.json({ error: 'target must be url or revenue' }, { status: 400 })
  }

  const ua = request.headers.get('user-agent') ?? ''
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()

  // Verify the project is public before recording
  const { data: project } = await supabase
    .from('projects')
    .select('id, is_public')
    .eq('id', project_id)
    .eq('is_public', true)
    .maybeSingle()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  await supabase.from('project_clicks').insert({
    project_id,
    target: target as ClickTarget,
  })

  return NextResponse.json({ ok: true })
}
