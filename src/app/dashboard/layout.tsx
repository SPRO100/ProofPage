import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireProfile } from '@/lib/auth/helpers'
import { signOut } from '@/app/actions/auth'
import styles from './dashboard.module.css'

const navigation = [
  ['Overview', '/dashboard', '⌂'],
  ['Profile', '/dashboard/profile', '○'],
  ['Projects', '/dashboard/projects', '□'],
  ['Revenue', '/dashboard/revenue', '↗'],
  ['Billing', '/dashboard/billing', '◇'],
] as const

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile()

  const initials = profile.display_name
    ? profile.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : profile.username.slice(0, 2).toUpperCase()

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.wordmark} href="/">ProofPage<span>.</span></Link>
        <nav className={styles.nav}>
          {navigation.map(([label, href, icon]) => (
            <Link href={href} key={href}><span>{icon}</span>{label}</Link>
          ))}
        </nav>
        <div className={styles.planCard}>
          <span>{profile.plan === 'pro' ? 'Pro plan' : 'Free plan'}</span>
          <strong>{profile.plan === 'free' ? '1 of 1 projects used' : 'Unlimited projects'}</strong>
          {profile.plan === 'free' && <Link href="/dashboard/billing">Upgrade to Pro →</Link>}
        </div>
        <div className={styles.user}>
          <div>{initials}</div>
          <p>
            <strong>{profile.display_name ?? profile.username}</strong>
            <span>proofpage.io/{profile.username}</span>
          </p>
          <form action={signOut}>
            <button type="submit" title="Sign out">•••</button>
          </form>
        </div>
      </aside>
      <div className={styles.main}>
        <header className={styles.mobileHeader}>
          <Link className={styles.wordmark} href="/">ProofPage<span>.</span></Link>
          <button>Menu</button>
        </header>
        {children}
      </div>
    </div>
  )
}
