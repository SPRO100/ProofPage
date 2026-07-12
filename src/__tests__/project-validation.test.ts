import { describe, expect, it } from 'vitest'
import { MAX_LOGO_SIZE, isProjectDeletionConfirmed, validateLogo, validateLogoBytes, validateProjectUpdate, type ProjectUpdateInput } from '@/lib/projects/validation'

const valid: ProjectUpdateInput = { name:'Productly',descriptionEn:'Product analytics',descriptionRu:'Аналитика продукта',url:'https://example.com',status:'active',isPublic:true,primaryMetricType:'users' }

describe('project editor validation', () => {
  it('accepts a valid bilingual project', () => expect(validateProjectUpdate(valid)).toEqual({}))
  it('rejects empty and oversized names', () => { expect(validateProjectUpdate({...valid,name:''}).name).toBeTruthy(); expect(validateProjectUpdate({...valid,name:'x'.repeat(101)}).name).toBeTruthy() })
  it('rejects javascript and malformed URLs', () => { expect(validateProjectUpdate({...valid,url:'javascript:alert(1)'}).url).toBeTruthy(); expect(validateProjectUpdate({...valid,url:'not a url'}).url).toBeTruthy() })
  it('allows an empty URL', () => expect(validateProjectUpdate({...valid,url:''}).url).toBeUndefined())
  it('rejects invalid status', () => expect(validateProjectUpdate({...valid,status:'invalid' as ProjectUpdateInput['status']}).status).toBeTruthy())
  it('rejects invalid primary metric', () => expect(validateProjectUpdate({...valid,primaryMetricType:'invalid' as ProjectUpdateInput['primaryMetricType']}).primary_metric_type).toBeTruthy())
  it('limits both descriptions', () => { expect(validateProjectUpdate({...valid,descriptionEn:'x'.repeat(1001)}).description_en).toBeTruthy(); expect(validateProjectUpdate({...valid,descriptionRu:'я'.repeat(1001)}).description_ru).toBeTruthy() })
})

describe('project logo validation', () => {
  it('accepts supported raster images', () => expect(validateLogo(new File(['x'],'logo.webp',{type:'image/webp'}))).toBeNull())
  it('rejects SVG to avoid active-content uploads', () => expect(validateLogo(new File(['<svg/>'],'logo.svg',{type:'image/svg+xml'}))).toContain('PNG'))
  it('rejects empty files', () => expect(validateLogo(new File([],'logo.png',{type:'image/png'}))).toContain('2 MB'))
  it('rejects files over 2 MB', () => expect(validateLogo(new File([new Uint8Array(MAX_LOGO_SIZE+1)],'logo.png',{type:'image/png'}))).toContain('2 MB'))
  it('rejects a spoofed PNG MIME type', () => expect(validateLogoBytes('image/png',new Uint8Array([60,115,99,114,105,112,116,62]))).toContain('does not match'))
  it('accepts PNG, JPEG and WebP signatures', () => {
    expect(validateLogoBytes('image/png',new Uint8Array([137,80,78,71,13,10,26,10]))).toBeNull()
    expect(validateLogoBytes('image/jpeg',new Uint8Array([255,216,255,1]))).toBeNull()
    expect(validateLogoBytes('image/webp',new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80]))).toBeNull()
  })
})

describe('project deletion confirmation', () => {
  const id='123e4567-e89b-12d3-a456-426614174000'
  it('requires a UUID and exact DELETE text', () => expect(isProjectDeletionConfirmed(id,'DELETE')).toBe(true))
  it('rejects a wrong confirmation', () => expect(isProjectDeletionConfirmed(id,'delete')).toBe(false))
  it('rejects a malformed project id', () => expect(isProjectDeletionConfirmed('not-a-project','DELETE')).toBe(false))
})
