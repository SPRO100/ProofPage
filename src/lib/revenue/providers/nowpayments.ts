import type { IRevenueProvider, ConnectResult, SyncResult } from '../provider'
import { registerProvider } from '../provider'

// NOWPayments revenue provider — crypto payment gateway.
// Credentials: NOWPayments API key.
const nowpaymentsProvider: IRevenueProvider = {
  name: 'nowpayments',

  async connect(rawCredential: string, _projectId: string): Promise<ConnectResult> {
    if (!rawCredential || rawCredential.length < 16) {
      return { ok: false, error: 'Invalid NOWPayments API key' }
    }

    const res = await fetch('https://api.nowpayments.io/v1/status', {
      headers: { 'x-api-key': rawCredential },
    })

    if (!res.ok) {
      return { ok: false, error: 'Invalid NOWPayments API key' }
    }

    return { ok: true, vaultSecretId: rawCredential }
  },

  async sync(apiKey: string): Promise<SyncResult> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const periodStart = thirtyDaysAgo.toISOString()
    const periodEnd = now.toISOString()

    try {
      const url = new URL('https://api.nowpayments.io/v1/payment')
      url.searchParams.set('dateFrom', periodStart)
      url.searchParams.set('dateTo', periodEnd)
      url.searchParams.set('paymentStatus', 'finished')
      url.searchParams.set('limit', '100')
      url.searchParams.set('sortBy', 'created_at')
      url.searchParams.set('orderBy', 'desc')

      const res = await fetch(url.toString(), {
        headers: { 'x-api-key': apiKey },
      })
      if (!res.ok) throw new Error('Failed to fetch NOWPayments data')

      const data = await res.json() as {
        data: Array<{ price_amount: number; price_currency: string }>
      }

      // Convert everything to USD equivalent (simplified — amounts stored as entered)
      let revenue_30d = 0
      for (const payment of data.data ?? []) {
        if (payment.price_currency.toUpperCase() === 'USD') {
          revenue_30d += payment.price_amount
        }
        // Non-USD crypto amounts shown as-is; conversion requires exchange rate API
      }

      return {
        ok: true,
        snapshot: {
          mrr: 0, // Crypto payments are typically one-time, not recurring
          revenue_30d: Math.round(revenue_30d * 100) / 100,
          revenue_total: Math.round(revenue_30d * 100) / 100,
          currency: 'USD',
          period_start: periodStart,
          period_end: periodEnd,
        },
      }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Sync failed' }
    }
  },

  async disconnect(_apiKey: string): Promise<void> {
    // Key is invalidated by the user in NOWPayments dashboard.
  },
}

registerProvider(nowpaymentsProvider)
export default nowpaymentsProvider
