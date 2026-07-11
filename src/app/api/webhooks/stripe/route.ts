import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBillingProvider } from '@/lib/billing/provider'
import '@/lib/billing/providers/index'
import type { WebhookEvent } from '@/lib/billing/provider'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  const provider = getBillingProvider('stripe')
  const event = await provider.parseWebhook(body, signature)
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await applyBillingEvent(event)
  return NextResponse.json({ received: true })
}

async function resolveProfileId(event: WebhookEvent): Promise<string | null> {
  if (event.profileId) return event.profileId

  // Fallback: look up by provider subscription ID
  const admin = createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('profile_id')
    .eq('provider', 'stripe')
    .eq('provider_subscription_id', event.providerSubscriptionId)
    .maybeSingle()

  return data?.profile_id ?? null
}

async function applyBillingEvent(event: WebhookEvent) {
  const profileId = await resolveProfileId(event)
  if (!profileId) return

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

    await admin.from('profiles').update({ plan: 'pro' }).eq('id', profileId)
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

    await admin.from('profiles').update({ plan: 'free' }).eq('id', profileId)
  }

  if (event.type === 'payment.failed') {
    await admin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('profile_id', profileId)
      .eq('provider', 'stripe')
  }
}
