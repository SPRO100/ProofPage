import Link from 'next/link'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import { requireProfile } from '@/lib/auth/helpers'
import { signOut } from '@/app/actions/auth'
import { LocaleToggle } from '@/components/locale-toggle'
import styles from './dashboard.module.css'

const navigation = {
  en: [['Overview','/dashboard','⌂'],['Profile','/dashboard/profile','○'],['Projects','/dashboard/projects','□'],['Revenue','/dashboard/revenue','↗'],['Billing','/dashboard/billing','◇']],
  ru: [['Обзор','/dashboard','⌂'],['Профиль','/dashboard/profile','○'],['Проекты','/dashboard/projects','□'],['Выручка','/dashboard/revenue','↗'],['Тариф','/dashboard/billing','◇']],
} as const

const copy = {
  en: { pro:'Pro plan', free:'Free plan', used:'1 of 1 projects used', unlimited:'Multiple projects enabled', upgrade:'Explore Pro →', public:'Public proof profile', signOut:'Sign out' },
  ru: { pro:'Тариф Pro', free:'Тариф Free', used:'Использован 1 из 1 проектов', unlimited:'Доступно несколько проектов', upgrade:'Посмотреть Pro →', public:'Публичный proof‑профиль', signOut:'Выйти' },
} as const

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile()
  const locale = (await cookies()).get('proofpage-locale')?.value === 'ru' ? 'ru' : 'en'
  const t = copy[locale]
  const initials = profile.display_name ? profile.display_name.split(' ').map((word: string) => word[0]).join('').slice(0,2).toUpperCase() : profile.username.slice(0,2).toUpperCase()
  const nav = <nav className={styles.nav}>{navigation[locale].map(([label,href,icon]) => <Link href={href} key={href}><span>{icon}</span>{label}</Link>)}</nav>

  return <div className={styles.app}>
    <aside className={styles.sidebar}>
      <Link className={styles.wordmark} href="/"><span>P</span>ProofPage</Link>
      {nav}
      <Link className={styles.publicLink} href={`/${profile.username}`} target="_blank">↗ {t.public}</Link>
      <div className={styles.planCard}><span>{profile.plan === 'pro' ? t.pro : t.free}</span><strong>{profile.plan === 'free' ? t.used : t.unlimited}</strong>{profile.plan === 'free' && <Link href="/dashboard/billing">{t.upgrade}</Link>}</div>
      <div className={styles.user}><div>{initials}</div><p><strong>{profile.display_name ?? profile.username}</strong><span>proofpage.io/{profile.username}</span></p><form action={signOut}><button type="submit" title={t.signOut}>↪</button></form></div>
    </aside>
    <div className={styles.main}><header className={styles.mobileHeader}><Link className={styles.wordmark} href="/"><span>P</span>ProofPage</Link><LocaleToggle/></header><div className={styles.mobileNav}>{nav}</div>{children}</div>
  </div>
}
