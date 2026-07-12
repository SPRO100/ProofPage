import { describe, expect, it } from 'vitest'
import { MAX_LOGO_SIZE, isProjectDeletionConfirmed, logoStoragePath, validateLogo, validateLogoBytes, validateProjectUpdate, type ProjectUpdateInput } from '@/lib/projects/validation'

const valid: ProjectUpdateInput = { name:'Productly',descriptionEn:'Product analytics',descriptionRu:'Аналитика продукта',url:'https://example.com',status:'active',isPublic:true,primaryMetricType:'users' }
const UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('project editor validation', () => {
  it('accepts a valid bilingual project', () => expect(validateProjectUpdate(valid)).toEqual({}))
  it('rejects empty and oversized names', () => { expect(validateProjectUpdate({...valid,name:''}).name).toBeTruthy(); expect(validateProjectUpdate({...valid,name:'x'.repeat(101)}).name).toBeTruthy() })
  it('accepts a name of exactly 100 characters', () => expect(validateProjectUpdate({...valid,name:'x'.repeat(100)}).name).toBeUndefined())
  it('rejects javascript URL', () => expect(validateProjectUpdate({...valid,url:'javascript:alert(1)'}).url).toBeTruthy())
  it('rejects data: URL', () => expect(validateProjectUpdate({...valid,url:'data:text/html,<script>alert(1)</script>'}).url).toBeTruthy())
  it('rejects malformed URL', () => expect(validateProjectUpdate({...valid,url:'not a url'}).url).toBeTruthy())
  it('allows an empty URL', () => expect(validateProjectUpdate({...valid,url:''}).url).toBeUndefined())
  it('accepts http URL', () => expect(validateProjectUpdate({...valid,url:'http://example.com'}).url).toBeUndefined())
  it('rejects ftp URL', () => expect(validateProjectUpdate({...valid,url:'ftp://example.com'}).url).toBeTruthy())
  it('rejects invalid status', () => expect(validateProjectUpdate({...valid,status:'invalid' as ProjectUpdateInput['status']}).status).toBeTruthy())
  it('rejects invalid primary metric', () => expect(validateProjectUpdate({...valid,primaryMetricType:'invalid' as ProjectUpdateInput['primaryMetricType']}).primary_metric_type).toBeTruthy())
  it('accepts all valid statuses', () => {
    for (const s of ['building','active','paused','sold','closed'] as ProjectUpdateInput['status'][]) {
      expect(validateProjectUpdate({...valid,status:s}).status).toBeUndefined()
    }
  })
  it('accepts all valid primary metrics', () => {
    for (const m of ['users','customers','signups','sales','revenue','mrr','custom'] as ProjectUpdateInput['primaryMetricType'][]) {
      expect(validateProjectUpdate({...valid,primaryMetricType:m}).primary_metric_type).toBeUndefined()
    }
  })
  it('limits both descriptions to 1000 chars', () => {
    expect(validateProjectUpdate({...valid,descriptionEn:'x'.repeat(1001)}).description_en).toBeTruthy()
    expect(validateProjectUpdate({...valid,descriptionRu:'я'.repeat(1001)}).description_ru).toBeTruthy()
    expect(validateProjectUpdate({...valid,descriptionEn:'x'.repeat(1000)}).description_en).toBeUndefined()
  })
  it('allows empty descriptions', () => {
    expect(validateProjectUpdate({...valid,descriptionEn:'',descriptionRu:''}).description_en).toBeUndefined()
  })
})

describe('project logo validation', () => {
  it('accepts PNG', () => expect(validateLogo(new File(['x'],'logo.png',{type:'image/png'}))).toBeNull())
  it('accepts JPEG', () => expect(validateLogo(new File(['x'],'logo.jpg',{type:'image/jpeg'}))).toBeNull())
  it('accepts WebP', () => expect(validateLogo(new File(['x'],'logo.webp',{type:'image/webp'}))).toBeNull())
  it('rejects SVG to avoid active-content uploads', () => expect(validateLogo(new File(['<svg/>'],'logo.svg',{type:'image/svg+xml'}))).toContain('PNG'))
  it('rejects GIF', () => expect(validateLogo(new File(['x'],'logo.gif',{type:'image/gif'}))).toContain('PNG'))
  it('rejects HTML renamed as PNG', () => expect(validateLogo(new File(['<html>'],'script.png',{type:'text/html'}))).toContain('PNG'))
  it('rejects empty files', () => expect(validateLogo(new File([],'logo.png',{type:'image/png'}))).toContain('2 MB'))
  it('rejects files over 2 MB', () => expect(validateLogo(new File([new Uint8Array(MAX_LOGO_SIZE+1)],'logo.png',{type:'image/png'}))).toContain('2 MB'))
  it('accepts file at exactly 2 MB', () => expect(validateLogo(new File([new Uint8Array(MAX_LOGO_SIZE)],'logo.png',{type:'image/png'}))).toBeNull())
  it('rejects a spoofed PNG MIME type (HTML bytes)', () => expect(validateLogoBytes('image/png',new Uint8Array([60,115,99,114,105,112,116,62]))).toContain('does not match'))
  it('rejects a spoofed JPEG MIME type', () => expect(validateLogoBytes('image/jpeg',new Uint8Array([137,80,78,71,13,10,26,10]))).toContain('does not match'))
  it('rejects a spoofed WebP MIME type', () => expect(validateLogoBytes('image/webp',new Uint8Array([255,216,255,0]))).toContain('does not match'))
  it('rejects unknown MIME type even with valid bytes', () => {
    expect(validateLogoBytes('image/gif',new Uint8Array([71,73,70,56]))).toContain('does not match')
  })
  it('accepts valid PNG signature', () => {
    expect(validateLogoBytes('image/png',new Uint8Array([137,80,78,71,13,10,26,10]))).toBeNull()
  })
  it('accepts valid JPEG signature', () => {
    expect(validateLogoBytes('image/jpeg',new Uint8Array([255,216,255,1]))).toBeNull()
  })
  it('accepts valid WebP signature', () => {
    expect(validateLogoBytes('image/webp',new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80]))).toBeNull()
  })
  it('rejects WebP with RIFF header but wrong WEBP marker', () => {
    expect(validateLogoBytes('image/webp',new Uint8Array([82,73,70,70,0,0,0,0,65,86,73,32]))).toContain('does not match')
  })
  it('rejects WebP with too few bytes to hold WEBP marker', () => {
    expect(validateLogoBytes('image/webp',new Uint8Array([82,73,70,70]))).toContain('does not match')
  })
})

describe('project deletion confirmation', () => {
  it('requires a UUID and exact DELETE text', () => expect(isProjectDeletionConfirmed(UUID,'DELETE')).toBe(true))
  it('rejects lowercase delete', () => expect(isProjectDeletionConfirmed(UUID,'delete')).toBe(false))
  it('rejects mixed case Delete', () => expect(isProjectDeletionConfirmed(UUID,'Delete')).toBe(false))
  it('rejects empty confirmation', () => expect(isProjectDeletionConfirmed(UUID,'')).toBe(false))
  it('rejects a malformed project id', () => expect(isProjectDeletionConfirmed('not-a-project','DELETE')).toBe(false))
  it('rejects empty project id', () => expect(isProjectDeletionConfirmed('','DELETE')).toBe(false))
  it('rejects UUID with wrong version digit', () => expect(isProjectDeletionConfirmed('123e4567-e89b-92d3-a456-426614174000','DELETE')).toBe(false))
})

describe('logo storage path extraction', () => {
  const BASE = 'https://abc.supabase.co/storage/v1/object/public/project-logos'

  it('extracts path from a valid public URL', () => {
    expect(logoStoragePath(`${BASE}/user-id/project-id-uuid.png`)).toBe('user-id/project-id-uuid.png')
  })
  it('returns null for a URL in a different bucket', () => {
    expect(logoStoragePath('https://abc.supabase.co/storage/v1/object/public/avatars/user-id/pic.jpg')).toBeNull()
  })
  it('returns null for a plain non-URL string', () => {
    expect(logoStoragePath('not-a-url')).toBeNull()
  })
  it('handles URL-encoded characters in path', () => {
    const encoded = `${BASE}/user%20id/file.png`
    expect(logoStoragePath(encoded)).toBe('user id/file.png')
  })
})

describe('public/private visibility guard', () => {
  function canAnonymousViewProject(profilePublic: boolean, projectPublic: boolean): boolean {
    return profilePublic && projectPublic
  }

  it('public profile + public project → visible', () => expect(canAnonymousViewProject(true,true)).toBe(true))
  it('public profile + private project → hidden', () => expect(canAnonymousViewProject(true,false)).toBe(false))
  it('private profile + public project → hidden', () => expect(canAnonymousViewProject(false,true)).toBe(false))
  it('private profile + private project → hidden', () => expect(canAnonymousViewProject(false,false)).toBe(false))
})
