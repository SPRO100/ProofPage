import { describe, expect, it } from 'vitest'
import { filterMetricPoints } from '@/lib/metrics/chart'

const now = new Date('2026-07-12T12:00:00Z').getTime()
const points = [
  { id:'old', value:10, measured_at:'2025-01-01T00:00:00Z' },
  { id:'month', value:30, measured_at:'2026-06-20T00:00:00Z' },
  { id:'week', value:40, measured_at:'2026-07-10T00:00:00Z' },
]

describe('metric chart periods', () => {
  it('keeps only the last seven days', () => expect(filterMetricPoints(points, '7d', now).map(p=>p.id)).toEqual(['week']))
  it('keeps the last thirty days in chronological order', () => expect(filterMetricPoints([...points].reverse(), '30d', now).map(p=>p.id)).toEqual(['month','week']))
  it('excludes points older than twelve months', () => expect(filterMetricPoints(points, '12m', now).map(p=>p.id)).toEqual(['month','week']))
  it('drops non-finite values from chart rendering', () => expect(filterMetricPoints([...points,{id:'bad',value:Infinity,measured_at:'2026-07-11T00:00:00Z'}], '30d', now).map(p=>p.id)).not.toContain('bad'))
  it('returns an empty state when a selected period has no points', () => expect(filterMetricPoints([points[0]], '7d', now)).toEqual([]))
  it('handles a single point without crashing', () => {
    const result = filterMetricPoints([points[2]], '7d', now)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('week')
  })
  it('handles all identical values without crashing', () => {
    const identical = [
      { id:'a', value:42, measured_at:'2026-07-10T00:00:00Z' },
      { id:'b', value:42, measured_at:'2026-07-11T00:00:00Z' },
    ]
    const result = filterMetricPoints(identical, '7d', now)
    expect(result).toHaveLength(2)
    expect(result.every(p => p.value === 42)).toBe(true)
  })
  it('returns empty array for empty input', () => {
    expect(filterMetricPoints([], '30d', now)).toEqual([])
  })
  it('drops points with corrupted date string', () => {
    const withBadDate = [...points, { id:'corrupt', value:99, measured_at:'not-a-date' }]
    const result = filterMetricPoints(withBadDate, '30d', now)
    expect(result.map(p=>p.id)).not.toContain('corrupt')
  })
  it('drops NaN value even if date is valid', () => {
    const withNaN = [...points, { id:'nan', value:NaN, measured_at:'2026-07-11T00:00:00Z' }]
    expect(filterMetricPoints(withNaN, '30d', now).map(p=>p.id)).not.toContain('nan')
  })
})
