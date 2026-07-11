import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBillingProvider } from '@/lib/billing/provider'
import '@/lib/billing/providers/index'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  const provider = getBillingProvider('stripe')
  const event = await provider.parseWebhook(body, signature)
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await applyBillingEvent(event.profileId, event)
  return NextResponse.json({ received: true })
}

async function applyBillingEvent(
  profileId: string | undefined,
  event: Awaited<ReturnType<ReturnType<typeof getBillingProvider>['parseWebhook']>>,
) {
  if (!event || !profileId) return

  const admin = createAdminClient()

  if (event.type === 'subscription.activated' || event.type === 'subscription.renewed') {
    await admin.from('subscriptions').upsert({
      profile_id: profileId,
      provider: 'stripe',
      provider_subscription_id: event.providerSubscriptionId,
      status: event.status,
      plan: 'pro',
      current_period_start: event.periodStart ?? new Date().toISOString(),
      current_period_end: event.periodEnd ?? new Date().toISOString(),
      cancel_at_period_end: event.cancelAtPeriodEnd ?? false,
    }, { onConflict: 'profile_id,provider' })

    await admin
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('id', profileId)
  }

  if (event.type === 'subscription.canceled' || event.type === 'subscription.expired') {
    await admin.from('subscriptions').upsert({
      profile_id: profileId,
      provider: 'stripe',
      provider_subscription_id: event.providerSubscriptionId,
      status: 'canceled',
      plan: 'free',
      current_period_start: event.periodStart ?? new Date().toISOString(),
      current_period_end: event.periodEnd ?? new Date().toISOString(),
      cancel_at_period_end: false,
    }, { onConflict: 'profile_id,provider' })

    await admin
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', profileId)
  }
}
