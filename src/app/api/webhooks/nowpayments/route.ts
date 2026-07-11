import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBillingProvider } from '@/lib/billing/provider'
import '@/lib/billing/providers/index'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-nowpayments-sig') ?? ''

  const provider = getBillingProvider('nowpayments')
  const event = await provider.parseWebhook(body, signature)
  if (!event) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  const admin = createAdminClient()

  let profileId = event.profileId
  if (!profileId) {
    const { data } = await admin
      .from('subscriptions')
      .select('profile_id')
      .eq('provider', 'nowpayments')
      .eq('provider_subscription_id', event.providerSubscriptionId)
      .maybeSingle()
    profileId = data?.profile_id ?? undefined
  }

  if (!profileId) return NextResponse.json({ received: true })

  if (event.type === 'subscription.activated') {
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await admin.from('subscriptions').upsert({
      profile_id: profileId,
      provider: 'nowpayments',
      provider_subscription_id: event.providerSubscriptionId,
      status: 'active',
      plan: 'pro',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
      cancel_at_period_end: false,
    }, { onConflict: 'profile_id,provider' })

    await admin.from('profiles').update({ plan: 'pro' }).eq('id', profileId)
  }

  if (event.type === 'payment.failed') {
    await admin
      .from('subscriptions')
      .update({ status: event.status })
      .eq('profile_id', profileId)
      .eq('provider', 'nowpayments')
  }

  return NextResponse.json({ received: true })
}
