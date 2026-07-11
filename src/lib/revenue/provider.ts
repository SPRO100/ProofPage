import type { RevenueProvider, RevenueMetric } from '@/types/database'

export interface ProviderCredentials {
  /** Opaque string — provider-specific, stored encrypted in Supabase Vault */
  secretRef: string
}

export interface RevenueSnapshot {
  mrr: number
  revenue_30d: number
  revenue_total: number
  currency: string
  period_start: string
  period_end: string
}

export interface SyncResult {
  ok: boolean
  snapshot?: RevenueSnapshot
  error?: string
}

export interface ConnectResult {
  ok: boolean
  /** Vault secret ID to store for future syncs */
  vaultSecretId?: string
  error?: string
}

/** One implementation per provider. Each must be stateless. */
export interface IRevenueProvider {
  readonly name: RevenueProvider
  /** Validate credentials and store them in Vault. Returns vault secret id. */
  connect(rawCredential: string, projectId: string): Promise<ConnectResult>
  /** Pull the latest revenue snapshot using the stored vault secret. */
  sync(vaultSecretId: string): Promise<SyncResult>
  /** Revoke stored credentials and clean up. */
  disconnect(vaultSecretId: string): Promise<void>
}

// ─── Registry ────────────────────────────────────────────────────────────────

const registry = new Map<RevenueProvider, IRevenueProvider>()

export function registerProvider(provider: IRevenueProvider) {
  registry.set(provider.name, provider)
}

export function getProvider(name: RevenueProvider): IRevenueProvider {
  const provider = registry.get(name)
  if (!provider) throw new Error(`Revenue provider not registered: ${name}`)
  return provider
}

export function listProviders(): RevenueProvider[] {
  return Array.from(registry.keys())
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function snapshotToMetricRow(
  snapshot: RevenueSnapshot,
  projectId: string,
  sourceId: string,
  isVerified: boolean,
): Omit<RevenueMetric, 'id' | 'recorded_at'> {
  return {
    project_id: projectId,
    source_id: sourceId,
    period_start: snapshot.period_start,
    period_end: snapshot.period_end,
    mrr: snapshot.mrr,
    revenue_30d: snapshot.revenue_30d,
    revenue_total: snapshot.revenue_total,
    currency: snapshot.currency,
    is_verified: isVerified,
  }
}
