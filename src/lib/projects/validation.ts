import type { ProjectMetricType, ProjectStatus } from '@/types/database'

export const PROJECT_STATUSES: ProjectStatus[] = ['building','active','paused','sold','closed']
export const PRIMARY_METRICS: ProjectMetricType[] = ['users','customers','signups','sales','revenue','mrr','custom']
export const LOGO_TYPES = ['image/png','image/jpeg','image/webp']
export const MAX_LOGO_SIZE = 2 * 1024 * 1024

export type ProjectUpdateInput = { name:string; descriptionEn:string; descriptionRu:string; url:string; status:ProjectStatus; isPublic:boolean; primaryMetricType:ProjectMetricType }

export function validateProjectUpdate(input: ProjectUpdateInput): Record<string,string> {
  const errors: Record<string,string> = {}
  if (!input.name || input.name.length > 100) errors.name = 'Project name must be 1–100 characters'
  if (input.descriptionEn.length > 1000) errors.description_en = 'English description is too long'
  if (input.descriptionRu.length > 1000) errors.description_ru = 'Russian description is too long'
  if (!PROJECT_STATUSES.includes(input.status)) errors.status = 'Invalid project status'
  if (!PRIMARY_METRICS.includes(input.primaryMetricType)) errors.primary_metric_type = 'Invalid primary metric'
  if (input.url) { try { const url = new URL(input.url); if (!['http:','https:'].includes(url.protocol)) errors.url = 'URL must use http or https' } catch { errors.url = 'Invalid project URL' } }
  return errors
}

export function validateLogo(file: File) {
  if (!LOGO_TYPES.includes(file.type)) return 'Logo must be PNG, JPEG or WebP'
  if (file.size <= 0 || file.size > MAX_LOGO_SIZE) return 'Logo must be smaller than 2 MB'
  return null
}

export function validateLogoBytes(type: string, bytes: Uint8Array) {
  const matches = type === 'image/png'
    ? [137,80,78,71,13,10,26,10].every((byte,index) => bytes[index] === byte)
    : type === 'image/jpeg'
      ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : type === 'image/webp'
        ? String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP'
        : false
  return matches ? null : 'File content does not match its image type'
}

export function isProjectDeletionConfirmed(projectId: string, confirmation: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId) && confirmation === 'DELETE'
}
