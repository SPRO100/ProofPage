'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { validateManualMetric, type ManualMetricInput } from '@/lib/metrics/manual'

export type MetricActionState = { error?: string; success?: string }

export async function addManualMetric(_previous: MetricActionState, formData: FormData): Promise<MetricActionState> {
  const user = await requireAuth()
  const input: ManualMetricInput = {
    projectId: String(formData.get('project_id') ?? ''),
    type: String(formData.get('metric_type') ?? '') as ManualMetricInput['type'],
    value: Number(formData.get('value')),
    measuredAt: String(formData.get('measured_at') ?? ''),
    labelEn: String(formData.get('label_en') ?? '').trim() || undefined,
    labelRu: String(formData.get('label_ru') ?? '').trim() || undefined,
    unit: String(formData.get('unit') ?? '').trim() || undefined,
    currency: String(formData.get('currency') ?? '').trim().toUpperCase() || undefined,
  }
  const validationError = validateManualMetric(input)
  if (validationError) return { error: validationError }

  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('id').eq('id', input.projectId).eq('profile_id', user.id).maybeSingle()
  if (!project) return { error: 'Project not found' }

  const { error } = await supabase.from('project_metrics').insert({
    project_id: input.projectId,
    metric_type: input.type,
    label_en: input.labelEn ?? null,
    label_ru: input.labelRu ?? null,
    value: input.value,
    unit: input.unit ?? null,
    currency: input.currency ?? null,
    source_status: 'manual',
    measured_at: new Date(input.measuredAt).toISOString(),
  })
  if (error) return { error: 'Failed to save metric' }
  revalidatePath('/dashboard/projects')
  return { success: 'Metric saved as unverified' }
}

export async function deleteManualMetric(formData: FormData): Promise<void> {
  const user = await requireAuth()
  const metricId = String(formData.get('metric_id') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(metricId)) return

  const supabase = await createClient()
  const { data: metric } = await supabase
    .from('project_metrics')
    .select('id, projects!inner(profile_id)')
    .eq('id', metricId)
    .eq('source_status', 'manual')
    .maybeSingle()
  const ownerId = (metric?.projects as unknown as { profile_id: string } | null)?.profile_id
  if (!metric || ownerId !== user.id) return

  const { error: deleteError } = await supabase.from('project_metrics').delete().eq('id', metricId).eq('source_status', 'manual')
  if (!deleteError) revalidatePath('/dashboard/projects')
}
