'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { LocaleToggle } from '@/components/locale-toggle'
import { useLocale, type Locale } from '@/lib/i18n/use-locale'

type Localized = Record<Locale, string>
type AuthShellProps = { children: ReactNode; eyebrow: Localized; title: Localized; description: Localized; footer: Record<Locale, ReactNode> }

const trust = {
  en: 'Revenue is never verified without a connected read-only source.',
  ru: 'Выручка не считается подтверждённой без подключённого read-only источника.',
}
const doodle = { en: 'proof → trust', ru: 'факты → доверие' } as const

export function AuthShell({ children, eyebrow, title, description, footer }: AuthShellProps) {
  const { locale } = useLocale()
  return <main className="auth-page">
    <header className="auth-header"><Link href="/" className="brand"><span className="brand-mark">P</span>ProofPage</Link><LocaleToggle /></header>
    <section className="auth-stage"><div className="auth-shell">
      <aside className="auth-story"><div><p className="auth-eyebrow">{eyebrow[locale]}</p><h1>{title[locale]}</h1><p>{description[locale]}</p></div><div className="auth-trust"><span>✓</span>{trust[locale]}</div><span className="auth-doodle" aria-hidden="true">{doodle[locale]}</span></aside>
      <div className="auth-form-panel">{children}<div className="auth-footer">{footer[locale]}</div></div>
    </div></section>
  </main>
}

export const fieldClass = 'app-field'
export const primaryButtonClass = 'app-primary-button'
