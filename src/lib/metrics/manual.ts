import type { MetricSourceStatus, ProjectMetricType } from '@/types/database'

export const METRIC_TYPES: ProjectMetricType[] = ['users', 'customers', 'signups', 'sales', 'revenue', 'mrr', 'custom']
export const MANUAL_SOURCE: MetricSourceStatus = 'manual'

export type ManualMetricInput = {
  projectId: string
  type: ProjectMetricType
  value: number
  measuredAt: string
  labelEn?: string
  labelRu?: string
  unit?: string
  currency?: string
}

export function validateManualMetric(input: ManualMetricInput): string | null {
  if (!/^[0-9a-f-]{36}$/i.test(input.projectId)) return 'Invalid project'
  if (!METRIC_TYPES.includes(input.type)) return 'Invalid metric type'
  if (!Number.isFinite(input.value) || input.value < 0 || input.value > 999_999_999_999) return 'Invalid metric value'
  if (Number.isNaN(Date.parse(input.measuredAt))) return 'Invalid measurement date'
  if (Date.parse(input.measuredAt) > Date.now() + 2 * 86_400_000) return 'Measurement date cannot be in the future'
  if (input.type === 'custom' && !input.labelEn?.trim() && !input.labelRu?.trim()) return 'Custom metrics need a label'
  if ((input.type === 'revenue' || input.type === 'mrr') && !/^[A-Z]{3}$/.test(input.currency ?? '')) return 'Revenue metrics need a currency'
  return null
}

export function metricStatusLabel(status: MetricSourceStatus, locale: 'en' | 'ru') {
  if (status === 'demo') return locale === 'ru' ? 'Демонстрационные данные' : 'Demo data'
  return locale === 'ru' ? 'Введено владельцем · Не подтверждено' : 'Owner entered · Unverified'
}
