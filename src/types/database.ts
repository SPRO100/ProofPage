// Auto-generated types would come from `supabase gen types typescript`.
// This file provides hand-written types until the Supabase project is connected.

export type Plan = 'free' | 'pro'
export type ProjectStatus = 'active' | 'paused' | 'building' | 'sold' | 'closed'
export type RevenueProvider = 'stripe' | 'yukassa' | 'nowpayments'
export type BillingProvider = 'stripe' | 'yukassa' | 'nowpayments'
export type RevenueSourceStatus = 'active' | 'error' | 'disconnected'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type ClickTarget = 'url' | 'revenue'
export type ProjectMetricType = 'users' | 'customers' | 'signups' | 'sales' | 'revenue' | 'mrr' | 'custom'
export type MetricSourceStatus = 'manual' | 'demo'

export interface ProfileLink {
  label: string
  url: string
}

export interface Theme {
  id: string
  name_en: string
  name_ru: string
  is_pro: boolean
  preview_url: string | null
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio_en: string | null
  bio_ru: string | null
  avatar_url: string | null
  location: string | null
  links: ProfileLink[]
  theme_id: string
  plan: Plan
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  profile_id: string
  name: string
  description_en: string | null
  description_ru: string | null
  url: string | null
  logo_url: string | null
  status: ProjectStatus
  sort_order: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface RevenueSource {
  id: string
  project_id: string
  provider: RevenueProvider
  vault_secret_id: string | null
  status: RevenueSourceStatus
  last_synced_at: string | null
  error_message: string | null
  created_at: string
}

export interface RevenueMetric {
  id: string
  project_id: string
  source_id: string | null
  period_start: string
  period_end: string
  mrr: number
  revenue_30d: number
  revenue_total: number
  currency: string
  is_verified: boolean
  recorded_at: string
}

export interface ProjectMetric {
  id: string
  project_id: string
  metric_type: ProjectMetricType
  label_en: string | null
  label_ru: string | null
  value: number
  unit: string | null
  currency: string | null
  source_status: MetricSourceStatus
  measured_at: string
  created_at: string
}

export interface Subscription {
  id: string
  profile_id: string
  provider: BillingProvider
  provider_subscription_id: string
  status: SubscriptionStatus
  plan: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// ─── Composite types used in API responses ───────────────────────────────────

export type VerificationState = 'verified' | 'stale' | 'error' | 'unverified'

export interface RevenueDisplay {
  mrr: number
  revenue_30d: number
  revenue_total: number
  currency: string
  state: VerificationState
  provider: RevenueProvider | null
  last_synced_at: string | null
}

export interface PublicProject extends Project {
  revenue: RevenueDisplay | null
}

export interface PublicProfile extends Profile {
  projects: PublicProject[]
}
