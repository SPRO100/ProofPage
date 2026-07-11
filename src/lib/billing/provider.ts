import type { BillingProvider, SubscriptionStatus } from '@/types/database'

export interface CheckoutParams {
  profileId: string
  email: string
  /** URL to redirect after successful payment */
  successUrl: string
  /** URL to redirect if the user cancels */
  cancelUrl: string
  /** ISO 4217 currency code — provider may override if not supported */
  preferredCurrency?: string
}

export interface CheckoutResult {
  ok: boolean
  /** Redirect the user to this URL to complete payment */
  checkoutUrl?: string
  error?: string
}

export interface WebhookEvent {
  type: 'subscription.activated' | 'subscription.renewed' | 'subscription.canceled' | 'subscription.expired' | 'payment.failed'
  providerSubscriptionId: string
  profileId?: string
  status: SubscriptionStatus
  periodStart?: string
  periodEnd?: string
  cancelAtPeriodEnd?: boolean
  raw: unknown
}

export interface IBillingProvider {
  readonly name: BillingProvider
  /** Create a hosted checkout session and return the redirect URL */
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>
  /** Parse and verify an incoming webhook payload */
  parseWebhook(body: string, signature: string): Promise<WebhookEvent | null>
}

// ─── Registry ────────────────────────────────────────────────────────────────

const registry = new Map<BillingProvider, IBillingProvider>()

export function registerBillingProvider(provider: IBillingProvider) {
  registry.set(provider.name, provider)
}

export function getBillingProvider(name: BillingProvider): IBillingProvider {
  const provider = registry.get(name)
  if (!provider) throw new Error(`Billing provider not registered: ${name}`)
  return provider
}

export function listBillingProviders(): BillingProvider[] {
  return Array.from(registry.keys())
}
