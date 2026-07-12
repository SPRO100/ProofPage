export function normalizeSupabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, '')
  let parsed: URL
  try { parsed = new URL(cleaned) } catch { throw new Error('NEXT_PUBLIC_SUPABASE_URL is invalid') }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS')
  return parsed.origin
}

export function getSupabaseUrl() {
  return normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
}
