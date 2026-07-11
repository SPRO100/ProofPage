import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { getBillingProvider } from '@/lib/billing/provider'
import '@/lib/billing/providers/index'
import type { BillingProvider } from '@/types/database'

// POST /api/billing/checkout
// Body: { provider: BillingProvider }
// Returns: { checkoutUrl: string }
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { provider?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { provider: providerName } = body
  if (!providerName || !['stripe', 'yukassa', 'nowpayments'].includes(providerName)) {
    return NextResponse.json({ error: 'Invalid provider. Use: stripe, yukassa, or nowpayments' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, username')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  if (profile.plan === 'pro') {
    return NextResponse.json({ error: 'Already on Pro plan' }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let billingProvider
  try {
    billingProvider = getBillingProvider(providerName as BillingProvider)
  } catch {
    return NextResponse.json({ error: 'Provider not available' }, { status: 400 })
  }

  const result = await billingProvider.createCheckout({
    profileId: user.id,
    email: user.email ?? '',
    successUrl: `${appUrl}/dashboard?upgrade=success`,
    cancelUrl: `${appUrl}/dashboard?upgrade=canceled`,
  })

  if (!result.ok || !result.checkoutUrl) {
    return NextResponse.json({ error: result.error ?? 'Failed to create checkout' }, { status: 500 })
  }

  return NextResponse.json({ checkoutUrl: result.checkoutUrl })
}
