import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProvider } from '@/lib/revenue/provider'
import '@/lib/revenue/providers/index'
import type { RevenueProvider } from '@/types/database'

// POST /api/cron/sync-revenue
// Called by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
// Syncs all active revenue sources that haven't been synced in 24h.
export async function POST(request: Request) {
  const secret = request.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Fetch all active sources due for sync
  const { data: sources, error } = await admin
    .from('revenue_sources')
    .select('id, project_id, provider, vault_secret_id')
    .eq('status', 'active')
    .not('vault_secret_id', 'is', null)
    .or(`last_synced_at.is.null,last_synced_at.lt.${cutoff}`)
    .limit(100)

  if (error) {
    console.error('[cron/sync-revenue] fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (sources ?? []).map(async (source) => {
      const provider = getProvider(source.provider as RevenueProvider)
      const result = await provider.sync(source.vault_secret_id!)

      if (!result.ok || !result.snapshot) {
        await admin
          .from('revenue_sources')
          .update({ status: 'error', error_message: result.error ?? 'Sync failed' })
          .eq('id', source.id)
        return { id: source.id, ok: false, error: result.error }
      }

      await admin.from('revenue_metrics').insert({
        project_id: source.project_id,
        source_id: source.id,
        period_start: result.snapshot.period_start,
        period_end: result.snapshot.period_end,
        mrr: result.snapshot.mrr,
        revenue_30d: result.snapshot.revenue_30d,
        revenue_total: result.snapshot.revenue_total,
        currency: result.snapshot.currency,
        is_verified: true,
      })

      await admin
        .from('revenue_sources')
        .update({ status: 'active', last_synced_at: new Date().toISOString(), error_message: null })
        .eq('id', source.id)

      return { id: source.id, ok: true }
    }),
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled' && (r.value as { ok: boolean }).ok).length
  const failed = results.length - succeeded

  console.log(`[cron/sync-revenue] synced ${succeeded}/${results.length}, failed: ${failed}`)
  return NextResponse.json({ synced: succeeded, failed, total: results.length })
}
