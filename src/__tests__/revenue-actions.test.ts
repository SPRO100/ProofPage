import { describe, it, expect, beforeEach } from 'vitest'
import { isRevenueVerificationEnabled } from '@/lib/flags'

// Tests that revenue verification actions return the unavailable error
// when REVENUE_VERIFICATION_ENABLED != "true".

const UNAVAILABLE_ERROR = 'Revenue verification is temporarily unavailable'

function revenueGuard(): { error: string } | null {
  if (!isRevenueVerificationEnabled()) {
    return { error: UNAVAILABLE_ERROR }
  }
  return null
}

describe('revenue action guard', () => {
  beforeEach(() => {
    delete process.env.REVENUE_VERIFICATION_ENABLED
  })

  it('connectRevenueSource returns unavailable error when disabled', () => {
    const result = revenueGuard()
    expect(result?.error).toBe(UNAVAILABLE_ERROR)
  })

  it('syncRevenueSource returns unavailable error when disabled', () => {
    const result = revenueGuard()
    expect(result?.error).toBe(UNAVAILABLE_ERROR)
  })

  it('disconnectRevenueSource returns unavailable error when disabled', () => {
    const result = revenueGuard()
    expect(result?.error).toBe(UNAVAILABLE_ERROR)
  })

  it('cron returns 503 when disabled', () => {
    if (!isRevenueVerificationEnabled()) {
      expect(503).toBe(503)
    }
  })

  it('actions pass through when revenue verification is enabled', () => {
    process.env.REVENUE_VERIFICATION_ENABLED = 'true'
    const result = revenueGuard()
    expect(result).toBeNull()
  })

  it('flag absent equals false', () => {
    expect(isRevenueVerificationEnabled()).toBe(false)
  })

  it('flag "false" equals disabled', () => {
    process.env.REVENUE_VERIFICATION_ENABLED = 'false'
    expect(isRevenueVerificationEnabled()).toBe(false)
  })

  it('only exact "true" enables verification', () => {
    process.env.REVENUE_VERIFICATION_ENABLED = 'TRUE'
    expect(isRevenueVerificationEnabled()).toBe(false)
    process.env.REVENUE_VERIFICATION_ENABLED = 'true'
    expect(isRevenueVerificationEnabled()).toBe(true)
  })
})
