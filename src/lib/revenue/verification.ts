import type { RevenueSource, RevenueMetric, VerificationState, RevenueDisplay } from '@/types/database'

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 hours

export function getVerificationState(source: RevenueSource | null): VerificationState {
  if (!source || source.status === 'disconnected') return 'unverified'
  if (source.status === 'error') return 'error'

  if (source.last_synced_at) {
    const age = Date.now() - new Date(source.last_synced_at).getTime()
    if (age > STALE_THRESHOLD_MS) return 'stale'
  }

  return 'verified'
}

export function buildRevenueDisplay(
  metric: RevenueMetric | null,
  source: RevenueSource | null,
): RevenueDisplay | null {
  if (!metric) return null

  const state = getVerificationState(source)

  return {
    mrr: metric.mrr,
    revenue_30d: metric.revenue_30d,
    revenue_total: metric.revenue_total,
    currency: metric.currency,
    state,
    provider: source?.provider ?? null,
    last_synced_at: source?.last_synced_at ?? null,
  }
}
