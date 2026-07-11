import { describe, expect, it } from 'vitest'
import { MANUAL_SOURCE, metricStatusLabel, validateManualMetric } from '@/lib/metrics/manual'

const valid = { projectId: '123e4567-e89b-12d3-a456-426614174000', type: 'users' as const, value: 120, measuredAt: '2026-07-11T10:00:00Z' }

describe('manual project metrics', () => {
  it('accepts a valid historical point', () => expect(validateManualMetric(valid)).toBeNull())
  it('rejects negative values', () => expect(validateManualMetric({ ...valid, value: -1 })).toBe('Invalid metric value'))
  it('requires a label for custom metrics', () => expect(validateManualMetric({ ...valid, type: 'custom' })).toBe('Custom metrics need a label'))
  it('requires ISO currency for revenue', () => expect(validateManualMetric({ ...valid, type: 'mrr' })).toBe('Revenue metrics need a currency'))
  it('never represents manual input as verified', () => {
    expect(MANUAL_SOURCE).toBe('manual')
    expect(metricStatusLabel(MANUAL_SOURCE, 'ru')).toContain('Не подтверждено')
    expect(metricStatusLabel(MANUAL_SOURCE, 'en')).toContain('Unverified')
  })
})
