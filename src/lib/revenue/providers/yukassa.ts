import type { IRevenueProvider, ConnectResult, SyncResult } from '../provider'
import { registerProvider } from '../provider'

// ЮKassa revenue provider — reads payments via ЮKassa API v3.
// Credentials: "shopId:secretKey" format.
const yukassaProvider: IRevenueProvider = {
  name: 'yukassa',

  async connect(rawCredential: string, _projectId: string): Promise<ConnectResult> {
    const parts = rawCredential.split(':')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { ok: false, error: 'Format: shopId:secretKey' }
    }

    const [shopId, secretKey] = parts
    const basic = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

    // Verify by fetching a single payment (limit 1)
    const res = await fetch('https://api.yookassa.ru/v3/payments?limit=1', {
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return { ok: false, error: 'Invalid ЮKassa credentials' }
    }

    return { ok: true, vaultSecretId: rawCredential }
  },

  async sync(credential: string): Promise<SyncResult> {
    const [shopId, secretKey] = credential.split(':')
    const basic = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const periodStart = thirtyDaysAgo.toISOString()
    const periodEnd = now.toISOString()

    try {
      const url = new URL('https://api.yookassa.ru/v3/payments')
      url.searchParams.set('status', 'succeeded')
      url.searchParams.set('created_at.gte', periodStart)
      url.searchParams.set('limit', '100')

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Basic ${basic}` },
      })
      if (!res.ok) throw new Error('Failed to fetch ЮKassa payments')

      const data = await res.json() as {
        items: Array<{ amount: { value: string; currency: string } }>
      }

      let revenue_30d = 0
      let currency = 'RUB'
      for (const payment of data.items) {
        revenue_30d += parseFloat(payment.amount.value)
        currency = payment.amount.currency
      }

      // ЮKassa doesn't have a subscription MRR concept natively —
      // approximate as revenue_30d (recurring billing via recurrent payments)
      const mrr = revenue_30d

      return {
        ok: true,
        snapshot: {
          mrr: Math.round(mrr * 100) / 100,
          revenue_30d: Math.round(revenue_30d * 100) / 100,
          revenue_total: Math.round(revenue_30d * 100) / 100,
          currency,
          period_start: periodStart,
          period_end: periodEnd,
        },
      }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Sync failed' }
    }
  },

  async disconnect(_credential: string): Promise<void> {
    // Credentials are invalidated by the user in ЮKassa dashboard.
  },
}

registerProvider(yukassaProvider)
export default yukassaProvider
