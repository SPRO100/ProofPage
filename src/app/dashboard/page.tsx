import Link from 'next/link'
import { cookies } from 'next/headers'
import { requireProfile } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import styles from './dashboard.module.css'

const copy = {
  en: { morning:'Good morning', afternoon:'Good afternoon', evening:'Good evening', eyebrow:'Founder dashboard', intro:'Keep your profile current and every proof source clear.', view:'View public page ↗', health:'Profile health', healthTitle:'Finish the details that build trust.', published:'Public profile published', projectAdded:'First project added', visible:'is visible', noProjects:'No projects yet', add:'Add →', story:'Add your founder story', storyDetail:'Give visitors context behind the work', edit:'Edit →', connect:'Revenue verification', connectDetail:'Read-only sources are coming after security review', source:'Review →', yourProject:'Your project', manage:'Manage project', emptyTitle:'No projects yet', emptyAction:'Add your first project →', next:'Your next project is waiting.', proText:'Pro will add multiple projects, verified revenue, themes, and deeper analytics after the security review.', pro:'Explore Pro', active:'Active' },
  ru: { morning:'Доброе утро', afternoon:'Добрый день', evening:'Добрый вечер', eyebrow:'Кабинет основателя', intro:'Поддерживайте профиль актуальным, а источники данных — понятными.', view:'Открыть публичную страницу ↗', health:'Готовность профиля', healthTitle:'Добавьте детали, которые создают доверие.', published:'Публичный профиль опубликован', projectAdded:'Первый проект добавлен', visible:'виден в профиле', noProjects:'Проектов пока нет', add:'Добавить →', story:'Добавьте историю основателя', storyDetail:'Дайте посетителям контекст вашей работы', edit:'Изменить →', connect:'Подтверждение выручки', connectDetail:'Read-only источники появятся после аудита безопасности', source:'Подробнее →', yourProject:'Ваш проект', manage:'Управлять проектом', emptyTitle:'Проектов пока нет', emptyAction:'Добавить первый проект →', next:'Ваш следующий проект ждёт.', proText:'После аудита Pro добавит проекты, подтверждённую выручку, темы и расширенную аналитику.', pro:'Посмотреть Pro', active:'Активен' },
} as const

function greeting(locale: 'en'|'ru') { const hour = new Date().getHours(); const t = copy[locale]; return hour < 12 ? t.morning : hour < 17 ? t.afternoon : t.evening }

export default async function DashboardPage() {
  const locale = (await cookies()).get('proofpage-locale')?.value === 'ru' ? 'ru' : 'en'
  const t = copy[locale]
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*').eq('profile_id', profile.id).order('sort_order', { ascending: true })
  const firstProject = projects?.[0] ?? null
  const checks = [!!profile.display_name, (projects?.length ?? 0) > 0, !!profile.bio_en, !!profile.avatar_url]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  return <main className={styles.content}>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>{t.eyebrow}</p><h1>{greeting(locale)}, {profile.display_name?.split(' ')[0] ?? profile.username}.</h1><p>{t.intro}</p></div><Link className={styles.primaryButton} href={`/${profile.username}`}>{t.view}</Link></div>
    <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>{t.health}</p><h2>{t.healthTitle}</h2></div><strong>{score}%</strong></div><div className={styles.progress}><span style={{ width: `${score}%` }}/></div><div className={styles.checklist}>
      <div className={profile.display_name ? styles.done : undefined}><span>{profile.display_name ? '✓' : '1'}</span><p><strong>{t.published}</strong><span>proofpage.io/{profile.username}</span></p></div>
      <div className={(projects?.length ?? 0) > 0 ? styles.done : undefined}><span>{(projects?.length ?? 0) > 0 ? '✓' : '2'}</span><p><strong>{t.projectAdded}</strong><span>{firstProject ? `${firstProject.name} ${t.visible}` : t.noProjects}</span></p>{!projects?.length && <Link href="/dashboard/projects">{t.add}</Link>}</div>
      <div className={profile.bio_en ? styles.done : undefined}><span>{profile.bio_en ? '✓' : '3'}</span><p><strong>{t.story}</strong><span>{t.storyDetail}</span></p>{!profile.bio_en && <Link href="/dashboard/profile">{t.edit}</Link>}</div>
      <div><span>4</span><p><strong>{t.connect}</strong><span>{t.connectDetail}</span></p><Link href="/dashboard/revenue">{t.source}</Link></div>
    </div></section>
    <section className={styles.twoColumns}>{firstProject ? <article className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>{t.yourProject}</p><h2>{firstProject.name}</h2></div><span className={`${styles.status} ${firstProject.status === 'active' ? styles.statusActive : ''}`}>{firstProject.status}</span></div>{firstProject.description_en && <p className={styles.bodyText}>{locale === 'ru' ? firstProject.description_ru ?? firstProject.description_en : firstProject.description_en}</p>}<Link className={styles.secondaryButton} href="/dashboard/projects">{t.manage}</Link></article> : <article className={styles.panel}><p className={styles.eyebrow}>{t.yourProject}</p><h2>{t.emptyTitle}</h2><Link className={styles.secondaryButton} href="/dashboard/projects">{t.emptyAction}</Link></article>}
      {profile.plan === 'free' && <article className={`${styles.panel} ${styles.upgradePanel}`}><span className={styles.proBadge}>PRO</span><h2>{t.next}</h2><p>{t.proText}</p><Link className={styles.goldButton} href="/dashboard/billing">{t.pro}</Link></article>}
    </section>
  </main>
}
