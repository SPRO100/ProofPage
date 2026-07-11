// Feature flags for billing and revenue verification.
// Both default to false — only the exact string "true" enables them.
// Never use NEXT_PUBLIC_* for these: server flags must stay server-side.

export function isBillingEnabled(): boolean {
  return process.env.BILLING_ENABLED === 'true'
}

export function isRevenueVerificationEnabled(): boolean {
  return process.env.REVENUE_VERIFICATION_ENABLED === 'true'
}
