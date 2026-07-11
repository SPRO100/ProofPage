import type { IRevenueProvider, ConnectResult, SyncResult } from '../provider'
import { registerProvider } from '../provider'

// Stripe revenue provider — reads MRR and rolling revenue via Stripe API.
// Credentials: Stripe restricted API key (read-only on charges + subscriptions).
const stripeProvider: IRevenueProvider = {
  name: 'stripe',

  async connect(rawCredential: string, _projectId: string): Promise<ConnectResult> {
    // Validate the key looks like a Stripe restricted key
    if (!rawCredential.startsWith('rk_') && !rawCredential.startsWith('sk_')) {
      return { ok: false, error: 'Must be a Stripe API key (rk_... or sk_...)' }
    }

    // Verify key works by fetching account info
    const res = await fetch('https://api.stripe.com/v1/account', {
      headers: { Authorization: `Bearer ${rawCredential}` },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: (body as { error?: { message?: string } }).error?.message ?? 'Invalid Stripe key' }
    }

    // Store in Vault via admin client (called from server action, not here)
    // Return the raw credential — caller stores it in Vault and saves vault_secret_id
    return { ok: true, vaultSecretId: rawCredential }
  },

  async sync(apiKey: string): Promise<SyncResult> {
    const now = Math.floor(Date.now() / 1000)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60
    const periodStart = new Date(thirtyDaysAgo * 1000).toISOString()
    const periodEnd = new Date(now * 1000).toISOString()

    try {
      // Fetch active subscriptions for MRR
      const subsRes = await fetch(
        'https://api.stripe.com/v1/subscriptions?status=active&limit=100',
        { headers: { Authorization: `Bearer ${apiKey}` } },
      )
      if (!subsRes.ok) throw new Error('Failed to fetch subscriptions')
      const subs = await subsRes.json() as { data: Array<{ plan?: { amount?: number; currency?: string; interval?: string }; items?: { data: Array<{ price?: { unit_amount?: number; currency?: string; recurring?: { interval?: string } } }> } }> }

      let mrr = 0
      let currency = 'usd'
      for (const sub of subs.data) {
        const item = sub.items?.data[0]
        const price = item?.price
        if (!price) continue
        const amount = (price.unit_amount ?? 0) / 100
        currency = price.currency ?? currency
        if (price.recurring?.interval === 'year') {
          mrr += amount / 12
        } else {
          mrr += amount
        }
      }

      // Fetch 30-day charges
      const chargesRes = await fetch(
        `https://api.stripe.com/v1/charges?created[gte]=${thirtyDaysAgo}&limit=100`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      )
      if (!chargesRes.ok) throw new Error('Failed to fetch charges')
      const charges = await chargesRes.json() as { data: Array<{ amount: number; currency: string; paid: boolean; refunded: boolean }> }

      let revenue_30d = 0
      for (const charge of charges.data) {
        if (charge.paid && !charge.refunded) {
          revenue_30d += charge.amount / 100
        }
      }

      // Total: sum all-time paid charges (simplified — use balance transactions in production)
      const revenue_total = revenue_30d

      return {
        ok: true,
        snapshot: {
          mrr: Math.round(mrr * 100) / 100,
          revenue_30d: Math.round(revenue_30d * 100) / 100,
          revenue_total: Math.round(revenue_total * 100) / 100,
          currency,
          period_start: periodStart,
          period_end: periodEnd,
        },
      }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Sync failed' }
    }
  },

  async disconnect(_vaultSecretId: string): Promise<void> {
    // Nothing to revoke on Stripe side — user revokes restricted key themselves.
    // Our Vault entry is deleted by the caller.
  },
}

registerProvider(stripeProvider)
export default stripeProvider
