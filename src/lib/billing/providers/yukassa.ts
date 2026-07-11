import type { IBillingProvider, CheckoutParams, CheckoutResult, WebhookEvent } from '../provider'
import { registerBillingProvider } from '../provider'
import type { SubscriptionStatus } from '@/types/database'
import { randomUUID } from 'crypto'

// ЮKassa billing — creates a hosted payment form for one-time Pro purchase.
// ЮKassa supports recurring payments via recurrent flag; simplified to one-time here.
const PRO_AMOUNT_RUB = process.env.YUKASSA_PRO_AMOUNT_RUB ?? '990.00'

const yukassaProvider: IBillingProvider = {
  name: 'yukassa',

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const shopId = process.env.YUKASSA_SHOP_ID
    const secretKey = process.env.YUKASSA_SECRET_KEY
    if (!shopId || !secretKey) return { ok: false, error: 'ЮKassa is not configured' }

    const basic = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
    const idempotencyKey = randomUUID()

    const body = {
      amount: { value: PRO_AMOUNT_RUB, currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: params.successUrl,
      },
      description: 'ProofPage Pro — подписка на 1 месяц',
      metadata: { profile_id: params.profileId },
      save_payment_method: true,
    }

    const res = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return { ok: false, error: 'Failed to create ЮKassa payment' }
    }

    const payment = await res.json() as {
      confirmation?: { confirmation_url?: string }
      id: string
    }

    return { ok: true, checkoutUrl: payment.confirmation?.confirmation_url }
  },

  async parseWebhook(body: string, signature: string): Promise<WebhookEvent | null> {
    const webhookSecret = process.env.YUKASSA_WEBHOOK_SECRET

    // ЮKassa signs notifications with HMAC-SHA256 if webhook secret is configured
    if (webhookSecret) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      )
      const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
      const expected = Array.from(new Uint8Array(mac))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      if (expected !== signature) return null
    }

    const event = JSON.parse(body) as {
      event: string
      object: {
        id: string
        status: string
        metadata?: { profile_id?: string }
        paid?: boolean
      }
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      succeeded: 'active',
      canceled: 'canceled',
      pending: 'trialing',
    }

    const typeMap: Record<string, WebhookEvent['type']> = {
      'payment.succeeded': 'subscription.activated',
      'payment.canceled': 'subscription.canceled',
      'refund.succeeded': 'subscription.canceled',
    }

    const mappedType = typeMap[event.event]
    if (!mappedType) return null

    return {
      type: mappedType,
      providerSubscriptionId: event.object.id,
      profileId: event.object.metadata?.profile_id,
      status: statusMap[event.object.status] ?? 'canceled',
      raw: event,
    }
  },
}

registerBillingProvider(yukassaProvider)
export default yukassaProvider
