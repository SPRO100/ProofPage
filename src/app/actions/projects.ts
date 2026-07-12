'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { isProjectDeletionConfirmed, validateLogo, validateLogoBytes, validateProjectUpdate, type ProjectUpdateInput } from '@/lib/projects/validation'
import type { ProjectMetricType, ProjectStatus } from '@/types/database'

export type ProjectActionState = { error?: string; success?: string; fieldErrors?: Record<string,string> }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function updateProject(_previous: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const user = await requireAuth()
  const projectId = String(formData.get('project_id') ?? '')
  if (!UUID.test(projectId)) return { error:'Invalid project' }
  const input: ProjectUpdateInput = {
    name:String(formData.get('name') ?? '').trim(),
    descriptionEn:String(formData.get('description_en') ?? '').trim(),
    descriptionRu:String(formData.get('description_ru') ?? '').trim(),
    url:String(formData.get('url') ?? '').trim(),
    status:String(formData.get('status') ?? '') as ProjectStatus,
    isPublic:formData.get('is_public') === 'on',
    primaryMetricType:String(formData.get('primary_metric_type') ?? '') as ProjectMetricType,
  }
  const fieldErrors = validateProjectUpdate(input)
  if (Object.keys(fieldErrors).length) return { fieldErrors }
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('id, logo_url').eq('id',projectId).eq('profile_id',user.id).maybeSingle()
  if (!project) return { error:'Project not found' }

  let logoUrl = project.logo_url as string | null
  const logo = formData.get('logo')
  if (logo instanceof File && logo.size > 0) {
    const logoError = validateLogo(logo)
    if (logoError) return { fieldErrors:{ logo:logoError } }
    const extension = ({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'} as Record<string,string>)[logo.type]
    const path = `${user.id}/${projectId}-${crypto.randomUUID()}.${extension}`
    const bytes = await logo.arrayBuffer()
    const contentError = validateLogoBytes(logo.type, new Uint8Array(bytes))
    if (contentError) return { fieldErrors:{ logo:contentError } }
    const { error: uploadError } = await supabase.storage.from('project-logos').upload(path, bytes, { contentType:logo.type, upsert:false })
    if (uploadError) return { error:'Failed to upload project logo' }
    logoUrl = supabase.storage.from('project-logos').getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabase.from('projects').update({ name:input.name, description_en:input.descriptionEn || null, description_ru:input.descriptionRu || null, url:input.url || null, status:input.status, is_public:input.isPublic, primary_metric_type:input.primaryMetricType, logo_url:logoUrl }).eq('id',projectId).eq('profile_id',user.id)
  if (error) return { error:'Failed to update project' }
  revalidatePath('/dashboard/projects'); revalidatePath('/[username]', 'page')
  return { success:'Project updated' }
}

export async function deleteProject(formData: FormData): Promise<void> {
  const user = await requireAuth()
  const projectId = String(formData.get('project_id') ?? '')
  const confirmation = String(formData.get('confirmation') ?? '')
  if (!isProjectDeletionConfirmed(projectId, confirmation)) return
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('id').eq('id',projectId).eq('profile_id',user.id).maybeSingle()
  if (!project) return
  const { error } = await supabase.from('projects').delete().eq('id',projectId).eq('profile_id',user.id)
  if (error) return
  revalidatePath('/dashboard/projects')
  redirect('/dashboard/projects')
}
