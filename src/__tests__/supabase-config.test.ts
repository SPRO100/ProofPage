import { describe, expect, it } from 'vitest'
import { normalizeSupabaseUrl } from '@/lib/supabase/config'

describe('Supabase URL normalization', () => {
  it('keeps a correct project root URL', () => expect(normalizeSupabaseUrl('https://example.supabase.co')).toBe('https://example.supabase.co'))
  it('strips the REST API path', () => expect(normalizeSupabaseUrl('https://example.supabase.co/rest/v1/')).toBe('https://example.supabase.co'))
  it('strips the auth API path', () => expect(normalizeSupabaseUrl('https://example.supabase.co/auth/v1')).toBe('https://example.supabase.co'))
  it('strips whitespace, quotes and trailing slash', () => expect(normalizeSupabaseUrl(' "https://example.supabase.co/" ')).toBe('https://example.supabase.co'))
  it('supports local Supabase', () => expect(normalizeSupabaseUrl('http://127.0.0.1:54321/rest/v1')).toBe('http://127.0.0.1:54321'))
  it('rejects a missing value', () => expect(() => normalizeSupabaseUrl(undefined)).toThrow('not configured'))
  it('rejects malformed and unsafe protocols', () => { expect(() => normalizeSupabaseUrl('not a url')).toThrow('invalid'); expect(() => normalizeSupabaseUrl('javascript:alert(1)')).toThrow('HTTP') })
})
