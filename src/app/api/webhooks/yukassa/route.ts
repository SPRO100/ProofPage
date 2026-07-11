import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBillingProvider } from '@/lib/billing/provider'
import '@/lib/billing/providers/index'

export async function POST(request: Request) {
  const body = await request.text()
  // ЮKassa sends signature in X-Hmac-Signature header (if configured)
  const signature = request.headers.get('x-hmac-signature') ?? ''

  const provider = getBillingProvider('yukassa')
  const event = await provider.parseWebhook(body, signature)
  if (!event) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  const admin = createAdminClient()
  const profileId = event.profileId

  if (!profileId) return NextResponse.json({ received: true })

  if (event.type === 'subscription.activated') {
    // One-time payment in ЮKassa grants 30 days of Pro
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await admin.from('subscriptions').upsert({
      profile_id: profileId,
      provider: 'yukassa',
      provider_subscription_id: event.providerSubscriptionId,
      status: 'active',
      plan: 'pro',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    }, { onConflict: 'profile_id,provider' })

    await admin.from('profiles').update({ plan: 'pro' }).eq('id', profileId)
  }

  if (event.type === 'subscription.canceled' || event.type === 'payment.failed') {
    await admin
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('profile_id', profileId)
      .eq('provider', 'yukassa')

    await admin.from('profiles').update({ plan: 'free' }).eq('id', profileId)
  }

  return NextResponse.json({ received: true })
}
