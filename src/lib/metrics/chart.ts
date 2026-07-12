import type { ChartPoint } from '@/components/metrics/metric-chart'

export type MetricPeriod = '7d' | '30d' | '12m'

export function filterMetricPoints(points: ChartPoint[], period: MetricPeriod, now = Date.now()) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 365
  const cutoff = now - days * 86_400_000
  return points
    .filter((point) => Number.isFinite(Number(point.value)) && new Date(point.measured_at).getTime() >= cutoff)
    .sort((a, b) => +new Date(a.measured_at) - +new Date(b.measured_at))
}
