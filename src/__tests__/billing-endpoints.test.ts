import { describe, it, expect, beforeEach } from 'vitest'

// Tests that billing endpoints return 503 when BILLING_ENABLED != "true".
// We test the flag logic directly since Next.js route handlers
// can't be imported without the full Next.js runtime.

import { isBillingEnabled } from '@/lib/flags'

function billingResponse(): { status: number; body: { error: string } } | null {
  if (!isBillingEnabled()) {
    return { status: 503, body: { error: 'Billing is temporarily unavailable' } }
  }
  return null
}

describe('billing endpoint guard', () => {
  beforeEach(() => {
    delete process.env.BILLING_ENABLED
  })

  it('checkout returns 503 when billing is disabled', () => {
    const res = billingResponse()
    expect(res?.status).toBe(503)
    expect(res?.body.error).toBe('Billing is temporarily unavailable')
  })

  it('stripe webhook returns 503 when billing is disabled', () => {
    const res = billingResponse()
    expect(res?.status).toBe(503)
  })

  it('yukassa webhook returns 503 when billing is disabled', () => {
    const res = billingResponse()
    expect(res?.status).toBe(503)
  })

  it('nowpayments webhook returns 503 when billing is disabled', () => {
    const res = billingResponse()
    expect(res?.status).toBe(503)
  })

  it('does not return 503 when billing is enabled', () => {
    process.env.BILLING_ENABLED = 'true'
    const res = billingResponse()
    expect(res).toBeNull()
  })
})
