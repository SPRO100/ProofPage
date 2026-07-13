'use client'

import { useCallback, useEffect, useState } from 'react'

export type Locale = 'en' | 'ru'

const eventName = 'proofpage-locale-change'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('proofpage-locale')
    if (saved === 'en' || saved === 'ru') queueMicrotask(() => setLocaleState(saved))
    const sync = (event: Event) => setLocaleState((event as CustomEvent<Locale>).detail)
    window.addEventListener(eventName, sync)
    return () => window.removeEventListener(eventName, sync)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem('proofpage-locale', next)
    document.cookie = `proofpage-locale=${next}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = next
    setLocaleState(next)
    window.dispatchEvent(new CustomEvent(eventName, { detail: next }))
  }, [])

  return { locale, setLocale }
}
