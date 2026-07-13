'use client'

import { useLocale } from '@/lib/i18n/use-locale'

export function LocaleToggle({ inverse = false }: { inverse?: boolean }) {
  const { locale, setLocale } = useLocale()
  return <div className={`app-locale-toggle${inverse ? ' app-locale-toggle--inverse' : ''}`} role="group" aria-label={locale === 'ru' ? 'Язык' : 'Language'}>
    <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button>
    <button type="button" className={locale === 'ru' ? 'active' : ''} onClick={() => setLocale('ru')}>RU</button>
  </div>
}
