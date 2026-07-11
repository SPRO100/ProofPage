import type { IBillingProvider, CheckoutParams, CheckoutResult, WebhookEvent } from '../provider'
import { registerBillingProvider } from '../provider'
import type { SubscriptionStatus } from '@/types/database'

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID ?? ''

const stripeProvider: IBillingProvider = {
  name: 'stripe',

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) return { ok: false, error: 'Stripe is not configured' }
    if (!PRO_PRICE_ID) return { ok: false, error: 'Stripe price ID not configured' }

    const body = new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': PRO_PRICE_ID,
      'line_items[0][quantity]': '1',
      'success_url': params.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      'cancel_url': params.cancelUrl,
      'customer_email': params.email,
      'metadata[profile_id]': params.profileId,
      'subscription_data[metadata][profile_id]': params.profileId,
    })

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
      return { ok: false, error: err.error?.message ?? 'Failed to create Stripe checkout' }
    }

    const session = await res.json() as { url: string }
    return { ok: true, checkoutUrl: session.url }
  },

  async parseWebhook(body: string, signature: string): Promise<WebhookEvent | null> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) return null

    // Verify Stripe signature
    const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=')
      if (k && v) acc[k] = v
      return acc
    }, {})

    const timestamp = parts['t']
    const sig = parts['v1']
    if (!timestamp || !sig) return null

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signedPayload = encoder.encode(`${timestamp}.${body}`)
    const mac = await crypto.subtle.sign('HMAC', key, signedPayload)
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (expected !== sig) return null

    const event = JSON.parse(body) as {
      type: string
      data: { object: {
        id: string
        status?: string
        metadata?: { profile_id?: string }
        current_period_start?: number
        current_period_end?: number
        cancel_at_period_end?: boolean
        subscription?: string
      } }
    }

    const obj = event.data.object
    const subId = obj.subscription ?? obj.id
    const profileId = obj.metadata?.profile_id

    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      canceled: 'canceled',
      incomplete_expired: 'canceled',
    }

    const typeMap: Record<string, WebhookEvent['type']> = {
      'customer.subscription.created': 'subscription.activated',
      'customer.subscription.updated': 'subscription.renewed',
      'customer.subscription.deleted': 'subscription.canceled',
      'invoice.payment_failed': 'payment.failed',
    }

    const mappedType = typeMap[event.type]
    if (!mappedType) return null

    return {
      type: mappedType,
      providerSubscriptionId: subId,
      profileId,
      status: statusMap[obj.status ?? ''] ?? 'canceled',
      periodStart: obj.current_period_start
        ? new Date(obj.current_period_start * 1000).toISOString()
        : undefined,
      periodEnd: obj.current_period_end
        ? new Date(obj.current_period_end * 1000).toISOString()
        : undefined,
      cancelAtPeriodEnd: obj.cancel_at_period_end,
      raw: event,
    }
  },
}

registerBillingProvider(stripeProvider)
export default stripeProvider
