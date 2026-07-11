// Revenue provider abstraction — shared types and interface.
// Concrete providers implement RevenueProvider and are registered in registry.ts.

export interface RevenueSnapshot {
  mrr: number
  revenue30d: number
  revenueTotal: number
  currency: string
  periodStart: Date
  periodEnd: Date
}

export interface RevenueProvider {
  readonly id: string

  // Called when a Pro user connects their account.
  // Credentials are stored encrypted in Supabase Vault; only the vault secret
  // ID is persisted in revenue_sources.vault_secret_id.
  connect(projectId: string, credentials: unknown): Promise<void>

  // Called by the sync cron job every hour.
  // Returns a snapshot of current revenue figures.
  sync(projectId: string, vaultSecretId: string): Promise<RevenueSnapshot>

  // Called when the user disconnects the integration.
  disconnect(projectId: string): Promise<void>
}
