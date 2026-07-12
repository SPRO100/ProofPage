import { describe, expect, it } from 'vitest'
import { MANUAL_SOURCE, metricStatusLabel, validateManualMetric } from '@/lib/metrics/manual'

const valid = { projectId: '123e4567-e89b-12d3-a456-426614174000', type: 'users' as const, value: 120, measuredAt: '2026-07-11T10:00:00Z' }

describe('manual project metrics', () => {
  it('accepts a valid historical point', () => expect(validateManualMetric(valid)).toBeNull())
  it('rejects negative values', () => expect(validateManualMetric({ ...valid, value: -1 })).toBe('Invalid metric value'))
  it('rejects NaN value', () => expect(validateManualMetric({ ...valid, value: NaN })).toBe('Invalid metric value'))
  it('rejects Infinity value', () => expect(validateManualMetric({ ...valid, value: Infinity })).toBe('Invalid metric value'))
  it('rejects value exceeding max', () => expect(validateManualMetric({ ...valid, value: 1_000_000_000_000 })).toBe('Invalid metric value'))
  it('rejects invalid project id', () => expect(validateManualMetric({ ...valid, projectId: 'not-a-uuid' })).toBe('Invalid project'))
  it('rejects unknown metric type', () => expect(validateManualMetric({ ...valid, type: 'verified' as 'users' })).toBe('Invalid metric type'))
  it('rejects bad date string', () => expect(validateManualMetric({ ...valid, measuredAt: 'not-a-date' })).toBe('Invalid measurement date'))
  it('requires a label for custom metrics', () => expect(validateManualMetric({ ...valid, type: 'custom' })).toBe('Custom metrics need a label'))
  it('rejects whitespace-only custom label', () => expect(validateManualMetric({ ...valid, type: 'custom', labelEn: '   ' })).toBe('Custom metrics need a label'))
  it('accepts custom metric with label', () => expect(validateManualMetric({ ...valid, type: 'custom', labelEn: 'DAU' })).toBeNull())
  it('requires ISO currency for revenue', () => expect(validateManualMetric({ ...valid, type: 'mrr' })).toBe('Revenue metrics need a currency'))
  it('rejects lowercase currency', () => expect(validateManualMetric({ ...valid, type: 'revenue', currency: 'usd' })).toBe('Revenue metrics need a currency'))
  it('rejects currency with wrong length', () => expect(validateManualMetric({ ...valid, type: 'revenue', currency: 'US' })).toBe('Revenue metrics need a currency'))
  it('accepts valid 3-letter currency', () => expect(validateManualMetric({ ...valid, type: 'revenue', currency: 'USD' })).toBeNull())
  it('never represents manual input as verified', () => {
    expect(MANUAL_SOURCE).toBe('manual')
    expect(metricStatusLabel(MANUAL_SOURCE, 'ru')).toContain('Не подтверждено')
    expect(metricStatusLabel(MANUAL_SOURCE, 'en')).toContain('Unverified')
  })
  it('demo status label is not unverified', () => {
    expect(metricStatusLabel('demo', 'en')).toContain('Demo')
    expect(metricStatusLabel('demo', 'ru')).toContain('Демо')
  })
  it('rejects dates more than 2 days in the future', () => {
    const farFuture = new Date(Date.now() + 3 * 86_400_000).toISOString()
    expect(validateManualMetric({ ...valid, measuredAt: farFuture })).toBe('Measurement date cannot be in the future')
  })
  it('accepts dates up to 2 days in the future', () => {
    const nearFuture = new Date(Date.now() + 86_400_000).toISOString()
    expect(validateManualMetric({ ...valid, measuredAt: nearFuture })).toBeNull()
  })
})
