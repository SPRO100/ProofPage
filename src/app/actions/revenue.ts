'use server'

import { redirect } from 'next/navigation'
import { isRevenueVerificationEnabled } from '@/lib/flags'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProvider } from '@/lib/revenue/provider'
import '@/lib/revenue/providers/index'
import type { RevenueProvider } from '@/types/database'

export interface RevenueActionState {
  error?: string
  success?: string
}

const UNAVAILABLE: RevenueActionState = {
  error: 'Revenue verification is temporarily unavailable',
}

// Connect a revenue source to a project
export async function connectRevenueSource(
  _prev: RevenueActionState,
  formData: FormData,
): Promise<RevenueActionState> {
  if (!isRevenueVerificationEnabled()) return UNAVAILABLE

  const user = await requireAuth()
  const projectId = formData.get('project_id') as string
  const providerName = formData.get('provider') as RevenueProvider
  const credential = formData.get('credential') as string

  if (!projectId || !providerName || !credential) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, profile_id')
    .eq('id', projectId)
    .eq('profile_id', user.id)
    .single()

  if (!project) return { error: 'Project not found' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return { error: 'Revenue provider connections require a Pro plan' }
  }

  let provider
  try {
    provider = getProvider(providerName)
  } catch {
    return { error: 'Unknown provider' }
  }

  const connectResult = await provider.connect(credential, projectId)
  if (!connectResult.ok) {
    return { error: connectResult.error ?? 'Connection failed' }
  }

  const admin = createAdminClient()
  const vaultName = `revenue_${providerName}_${projectId}`

  const { data: vaultEntry, error: vaultError } = await admin.rpc('vault_upsert_secret', {
    p_name: vaultName,
    p_secret: connectResult.vaultSecretId!,
  })

  if (vaultError || !vaultEntry) {
    console.error('Vault storage failed:', vaultError)
    return { error: 'Failed to securely store credentials. Check Supabase Vault is enabled.' }
  }

  const vaultSecretId = vaultEntry as string

  const { error: sourceError } = await supabase
    .from('revenue_sources')
    .upsert({
      project_id: projectId,
      provider: providerName,
      vault_secret_id: vaultSecretId,
      status: 'active',
      error_message: null,
    }, { onConflict: 'project_id,provider' })

  if (sourceError) return { error: 'Failed to save revenue source' }

  return { success: 'Revenue source connected. Syncing data now…' }
}

// Disconnect a revenue source
export async function disconnectRevenueSource(
  _prev: RevenueActionState,
  formData: FormData,
): Promise<RevenueActionState> {
  if (!isRevenueVerificationEnabled()) return UNAVAILABLE

  const user = await requireAuth()
  const sourceId = formData.get('source_id') as string

  if (!sourceId) return { error: 'Missing source_id' }

  const supabase = await createClient()

  const { data: source } = await supabase
    .from('revenue_sources')
    .select('id, vault_secret_id, provider, projects!inner(profile_id)')
    .eq('id', sourceId)
    .single()

  const projectOwner = (source?.projects as unknown as { profile_id: string } | null)?.profile_id
  if (!source || projectOwner !== user.id) {
    return { error: 'Revenue source not found' }
  }

  await supabase
    .from('revenue_sources')
    .update({ status: 'disconnected', vault_secret_id: null })
    .eq('id', sourceId)

  redirect('/dashboard')
}

// Manually trigger a sync for a revenue source
export async function syncRevenueSource(
  _prev: RevenueActionState,
  formData: FormData,
): Promise<RevenueActionState> {
  if (!isRevenueVerificationEnabled()) return UNAVAILABLE

  const user = await requireAuth()
  const sourceId = formData.get('source_id') as string

  if (!sourceId) return { error: 'Missing source_id' }

  const supabase = await createClient()

  const { data: source } = await supabase
    .from('revenue_sources')
    .select('id, vault_secret_id, provider, project_id, projects!inner(profile_id)')
    .eq('id', sourceId)
    .single()

  const projectOwner = (source?.projects as unknown as { profile_id: string } | null)?.profile_id
  if (!source || projectOwner !== user.id) {
    return { error: 'Revenue source not found' }
  }

  if (!source.vault_secret_id) {
    return { error: 'No credentials stored for this source' }
  }

  const provider = getProvider(source.provider as RevenueProvider)
  const result = await provider.sync(source.vault_secret_id)

  if (!result.ok || !result.snapshot) {
    await supabase
      .from('revenue_sources')
      .update({ status: 'error', error_message: result.error ?? 'Sync failed' })
      .eq('id', sourceId)
    return { error: result.error ?? 'Sync failed' }
  }

  await supabase.from('revenue_metrics').insert({
    project_id: source.project_id,
    source_id: sourceId,
    period_start: result.snapshot.period_start,
    period_end: result.snapshot.period_end,
    mrr: result.snapshot.mrr,
    revenue_30d: result.snapshot.revenue_30d,
    revenue_total: result.snapshot.revenue_total,
    currency: result.snapshot.currency,
    is_verified: true,
  })

  await supabase
    .from('revenue_sources')
    .update({ status: 'active', last_synced_at: new Date().toISOString(), error_message: null })
    .eq('id', sourceId)

  return { success: 'Revenue synced successfully' }
}
