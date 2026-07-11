import { describe, it, expect, beforeEach } from 'vitest'
import { isBillingEnabled, isRevenueVerificationEnabled } from '@/lib/flags'

describe('isBillingEnabled', () => {
  beforeEach(() => {
    delete process.env.BILLING_ENABLED
  })

  it('returns false when env var is absent', () => {
    expect(isBillingEnabled()).toBe(false)
  })

  it('returns false when set to "false"', () => {
    process.env.BILLING_ENABLED = 'false'
    expect(isBillingEnabled()).toBe(false)
  })

  it('returns false when set to empty string', () => {
    process.env.BILLING_ENABLED = ''
    expect(isBillingEnabled()).toBe(false)
  })

  it('returns false when set to "1"', () => {
    process.env.BILLING_ENABLED = '1'
    expect(isBillingEnabled()).toBe(false)
  })

  it('returns true only when set to exact string "true"', () => {
    process.env.BILLING_ENABLED = 'true'
    expect(isBillingEnabled()).toBe(true)
  })
})

describe('isRevenueVerificationEnabled', () => {
  beforeEach(() => {
    delete process.env.REVENUE_VERIFICATION_ENABLED
  })

  it('returns false when env var is absent', () => {
    expect(isRevenueVerificationEnabled()).toBe(false)
  })

  it('returns false when set to "false"', () => {
    process.env.REVENUE_VERIFICATION_ENABLED = 'false'
    expect(isRevenueVerificationEnabled()).toBe(false)
  })

  it('returns false when set to empty string', () => {
    process.env.REVENUE_VERIFICATION_ENABLED = ''
    expect(isRevenueVerificationEnabled()).toBe(false)
  })

  it('returns true only when set to exact string "true"', () => {
    process.env.REVENUE_VERIFICATION_ENABLED = 'true'
    expect(isRevenueVerificationEnabled()).toBe(true)
  })
})
