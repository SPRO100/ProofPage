import Link from 'next/link'
import { requireProfile } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import styles from './dashboard.module.css'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true })

  const firstProject = projects?.[0] ?? null

  const checks = [
    !!profile.display_name,
    (projects?.length ?? 0) > 0,
    !!profile.bio_en,
    !!profile.avatar_url,
  ]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  return (
    <main className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Founder dashboard</p>
          <h1>{greeting()}, {profile.display_name?.split(' ')[0] ?? profile.username}.</h1>
          <p>Keep your profile current and your proof credible.</p>
        </div>
        <Link className={styles.primaryButton} href={`/${profile.username}`}>
          View public page ↗
        </Link>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Profile health</p>
            <h2>Finish the details that build trust.</h2>
          </div>
          <strong>{score}%</strong>
        </div>
        <div className={styles.progress}>
          <span style={{ width: `${score}%` }} />
        </div>
        <div className={styles.checklist}>
          <div className={profile.display_name ? styles.done : undefined}>
            {profile.display_name ? '✓' : '1'}
            <p>
              <strong>Public profile published</strong>
              <span>proofpage.io/{profile.username}</span>
            </p>
          </div>
          <div className={(projects?.length ?? 0) > 0 ? styles.done : undefined}>
            {(projects?.length ?? 0) > 0 ? '✓' : '2'}
            <p>
              <strong>First project added</strong>
              <span>{firstProject ? firstProject.name + ' is visible' : 'No projects yet'}</span>
            </p>
            {!(projects?.length) && <Link href="/dashboard/projects">Add →</Link>}
          </div>
          <div className={profile.bio_en ? styles.done : undefined}>
            {profile.bio_en ? '✓' : '3'}
            <p>
              <strong>Add your founder story</strong>
              <span>Show the milestones behind the projects</span>
            </p>
            {!profile.bio_en && <Link href="/dashboard/profile">Edit →</Link>}
          </div>
          <div>
            4
            <p>
              <strong>Connect a revenue source</strong>
              <span>Replace manual figures with verified proof</span>
            </p>
            <Link href="/dashboard/revenue">Connect →</Link>
          </div>
        </div>
      </section>

      <section className={styles.twoColumns}>
        {firstProject ? (
          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.eyebrow}>Your project</p>
                <h2>{firstProject.name}</h2>
              </div>
              <span className={styles.status}>{firstProject.status}</span>
            </div>
            {firstProject.description_en && (
              <p className={styles.bodyText}>{firstProject.description_en}</p>
            )}
            <Link className={styles.secondaryButton} href="/dashboard/projects">
              Manage project
            </Link>
          </article>
        ) : (
          <article className={styles.panel}>
            <p className={styles.eyebrow}>Your project</p>
            <h2>No projects yet</h2>
            <Link className={styles.secondaryButton} href="/dashboard/projects">
              Add your first project →
            </Link>
          </article>
        )}

        {profile.plan === 'free' && (
          <article className={`${styles.panel} ${styles.upgradePanel}`}>
            <span className={styles.proBadge}>PRO</span>
            <h2>Your next project is waiting.</h2>
            <p>Add unlimited projects, verified revenue, more themes, and deeper analytics.</p>
            <Link className={styles.goldButton} href="/dashboard/billing">Explore Pro</Link>
          </article>
        )}
      </section>
    </main>
  )
}
