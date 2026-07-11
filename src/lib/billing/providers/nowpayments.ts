import type { IBillingProvider, CheckoutParams, CheckoutResult, WebhookEvent } from '../provider'
import { registerBillingProvider } from '../provider'

const PRO_AMOUNT_USD = process.env.NOWPAYMENTS_PRO_AMOUNT_USD ?? '9.99'

const nowpaymentsProvider: IBillingProvider = {
  name: 'nowpayments',

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) return { ok: false, error: 'NOWPayments is not configured' }

    // Create a payment invoice link
    const res = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: PRO_AMOUNT_USD,
        price_currency: 'usd',
        order_id: params.profileId,
        order_description: 'ProofPage Pro subscription',
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        is_fixed_rate: true,
        is_fee_paid_by_user: false,
      }),
    })

    if (!res.ok) {
      return { ok: false, error: 'Failed to create crypto invoice' }
    }

    const invoice = await res.json() as { invoice_url?: string; id?: string }
    if (!invoice.invoice_url) return { ok: false, error: 'No invoice URL returned' }

    return { ok: true, checkoutUrl: invoice.invoice_url }
  },

  async parseWebhook(body: string, signature: string): Promise<WebhookEvent | null> {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET
    if (!ipnSecret) return null

    // NOWPayments signs IPN with HMAC-SHA512
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ipnSecret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign'],
    )

    // Sort JSON body keys for consistent signing
    const parsed = JSON.parse(body)
    const sorted = JSON.stringify(
      Object.fromEntries(Object.keys(parsed).sort().map((k) => [k, parsed[k]])),
    )
    const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(sorted))
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (expected !== signature) return null

    const event = parsed as {
      payment_id: string
      payment_status: string
      order_id?: string
    }

    const finishedStatuses = ['finished', 'confirmed', 'sending']
    const failedStatuses = ['failed', 'refunded', 'expired']

    if (finishedStatuses.includes(event.payment_status)) {
      return {
        type: 'subscription.activated',
        providerSubscriptionId: String(event.payment_id),
        profileId: event.order_id,
        status: 'active',
        raw: event,
      }
    }

    if (failedStatuses.includes(event.payment_status)) {
      return {
        type: 'payment.failed',
        providerSubscriptionId: String(event.payment_id),
        profileId: event.order_id,
        status: 'canceled',
        raw: event,
      }
    }

    return null
  },
}

registerBillingProvider(nowpaymentsProvider)
export default nowpaymentsProvider
