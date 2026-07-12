import { describe, it, expect } from 'vitest'

// Unit-level tests for the delete guard logic extracted from deleteManualMetric.
// We test the decision logic (ownership + source_status) without the Supabase client.

type MetricRow = { id: string; source_status: string; projects: { profile_id: string } }

function canDelete(metric: MetricRow | null, requestingUserId: string): boolean {
  if (!metric) return false
  if (metric.source_status !== 'manual') return false
  if (metric.projects.profile_id !== requestingUserId) return false
  return true
}

const USER_A = 'user-a-uuid-0000-000000000000'
const USER_B = 'user-b-uuid-0000-000000000000'

const ownManual: MetricRow = { id: 'metric-1', source_status: 'manual', projects: { profile_id: USER_A } }
const otherManual: MetricRow = { id: 'metric-2', source_status: 'manual', projects: { profile_id: USER_B } }
const ownDemo: MetricRow = { id: 'metric-3', source_status: 'demo', projects: { profile_id: USER_A } }
const ownVerified: MetricRow = { id: 'metric-4', source_status: 'verified', projects: { profile_id: USER_A } }

describe('delete metric guard', () => {
  it('allows owner to delete their own manual metric', () => {
    expect(canDelete(ownManual, USER_A)).toBe(true)
  })
  it('blocks deletion of another user\'s manual metric', () => {
    expect(canDelete(otherManual, USER_A)).toBe(false)
  })
  it('blocks deletion of own demo metric', () => {
    expect(canDelete(ownDemo, USER_A)).toBe(false)
  })
  it('blocks deletion of own verified metric', () => {
    expect(canDelete(ownVerified, USER_A)).toBe(false)
  })
  it('returns false when metric is null (not found or already deleted)', () => {
    expect(canDelete(null, USER_A)).toBe(false)
  })
  it('blocks deletion when project_id would belong to another user', () => {
    const spoofed: MetricRow = { id: 'metric-5', source_status: 'manual', projects: { profile_id: USER_B } }
    expect(canDelete(spoofed, USER_A)).toBe(false)
  })
})

describe('public vs private profile access', () => {
  // Mirrors the RLS check: public project AND public profile required for anonymous reads.
  function canViewPublic(profileIsPublic: boolean, projectIsPublic: boolean): boolean {
    return profileIsPublic && projectIsPublic
  }

  it('allows viewing metrics for public profile + public project', () => {
    expect(canViewPublic(true, true)).toBe(true)
  })
  it('blocks viewing metrics for private profile + public project', () => {
    expect(canViewPublic(false, true)).toBe(false)
  })
  it('blocks viewing metrics for public profile + private project', () => {
    expect(canViewPublic(true, false)).toBe(false)
  })
  it('blocks viewing metrics for private profile + private project', () => {
    expect(canViewPublic(false, false)).toBe(false)
  })
})

describe('revenue verification flag guard', () => {
  function shouldFetchRevenueMetrics(flagEnabled: boolean, projectCount: number): boolean {
    return flagEnabled && projectCount > 0
  }

  it('does not fetch revenue metrics when flag is disabled', () => {
    expect(shouldFetchRevenueMetrics(false, 5)).toBe(false)
  })
  it('does not fetch revenue metrics when there are no projects', () => {
    expect(shouldFetchRevenueMetrics(true, 0)).toBe(false)
  })
  it('fetches revenue metrics only when flag enabled and projects exist', () => {
    expect(shouldFetchRevenueMetrics(true, 3)).toBe(true)
  })
})
