import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildRevenueDisplay } from '@/lib/revenue/verification'
import { isRevenueVerificationEnabled } from '@/lib/flags'
import { MetricChart } from '@/components/metrics/metric-chart'
import { LocaleToggle } from '@/components/locale-toggle'
import type { ProfileLink, ProjectMetric, ProjectStatus, RevenueMetric, RevenueSource } from '@/types/database'
import styles from '../demo-founder/profile.module.css'

type PageProps = { params: Promise<{ username: string }>; searchParams: Promise<{ preview?: string }> }

const copy = {
  en: { founder:'Founder proof profile', total:'Total verified revenue', noVerified:'No verified revenue yet', across:'Across', connectedOne:'connected project', connectedMany:'connected projects', public:'Public ProofPage profile', preview:'Private owner preview', previewNote:'Drafts and private profile data are visible only to you.', dashboard:'Dashboard', portfolio:'Portfolio', building:"What I'm building", project:'project', projects:'projects', empty:'No public projects yet', emptyText:'This founder is still preparing their proof profile.', coming:'Project details coming soon.', primary:'Primary metric', metric:'Metric', status:'Status', source:'Source', verified:'Verified', unverified:'Unverified', owner:'Owner entered', revenueVerified:'Revenue verified', manual:'Owner entered · Unverified', noData:'No data', synced:'Synced', built:'Built with', create:'Create your ProofPage →', share:'Share profile' },
  ru: { founder:'Proof‑профиль основателя', total:'Подтверждённая выручка', noVerified:'Подтверждённой выручки пока нет', across:'Для', connectedOne:'подключённого проекта', connectedMany:'подключённых проектов', public:'Публичный профиль ProofPage', preview:'Приватный предпросмотр владельца', previewNote:'Черновики и приватные данные видны только вам.', dashboard:'Кабинет', portfolio:'Портфолио', building:'Что я создаю', project:'проект', projects:'проектов', empty:'Публичных проектов пока нет', emptyText:'Основатель ещё готовит свой proof‑профиль.', coming:'Описание скоро появится.', primary:'Главный показатель', metric:'Показатель', status:'Статус', source:'Источник', verified:'Подтверждено', unverified:'Не подтверждено', owner:'Введено владельцем', revenueVerified:'Выручка подтверждена', manual:'Введено владельцем · Не подтверждено', noData:'Нет данных', synced:'Обновлено', built:'Создано с', create:'Создать свою ProofPage →', share:'Поделиться профилем' },
} as const

const statusLabels = {
  en: { active:'Active', paused:'Paused', building:'Building', sold:'Sold', closed:'Closed' },
  ru: { active:'Активен', paused:'Приостановлен', building:'Создаётся', sold:'Продан', closed:'Закрыт' },
} as const

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params; const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('display_name, bio_en').eq('username',username).eq('is_public',true).maybeSingle()
  if (!data) return { title:'Profile not found · ProofPage' }
  return { title:`${data.display_name ?? username} · ProofPage`, description:data.bio_en ?? `Projects by ${data.display_name ?? username}` }
}

export default async function PublicFounderPage({ params, searchParams }: PageProps) {
  const { username } = await params
  const ownerPreview = (await searchParams).preview === '1'
  const locale = (await cookies()).get('proofpage-locale')?.value === 'ru' ? 'ru' : 'en'
  const t = copy[locale]
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profileQuery = supabase.from('profiles').select('*').eq('username',username)
  if (!ownerPreview) profileQuery = profileQuery.eq('is_public',true)
  const { data: profile } = await profileQuery.maybeSingle()
  if (!profile || (ownerPreview && user?.id !== profile.id)) notFound()

  let projectsQuery = supabase.from('projects').select('*').eq('profile_id',profile.id)
  if (!ownerPreview) projectsQuery = projectsQuery.eq('is_public',true)
  const { data: projects } = await projectsQuery.order('sort_order')
  const projectList = projects ?? []
  const projectIds = projectList.map((project) => project.id)
  const { data: metrics } = isRevenueVerificationEnabled() && projectIds.length ? await supabase.from('revenue_metrics').select('*').in('project_id',projectIds).order('recorded_at',{ascending:false}) : { data:[] }
  const { data: manualMetricRows } = projectIds.length ? await supabase.from('project_metrics').select('*').in('project_id',projectIds).order('measured_at',{ascending:true}) : { data:[] }
  const manualByProject = new Map<string,ProjectMetric[]>()
  for (const metric of (manualMetricRows ?? []) as ProjectMetric[]) manualByProject.set(metric.project_id,[...(manualByProject.get(metric.project_id) ?? []),metric])
  const latestByProject = new Map<string,RevenueMetric>()
  for (const metric of (metrics ?? []) as RevenueMetric[]) if (!latestByProject.has(metric.project_id)) latestByProject.set(metric.project_id,metric)
  const sourceIds = [...latestByProject.values()].map((metric) => metric.source_id).filter((id): id is string => Boolean(id))
  const { data: sources } = sourceIds.length ? await supabase.from('revenue_sources').select('*').in('id',sourceIds) : { data:[] }
  const sourceById = new Map((sources ?? []).map((source) => [source.id,source as RevenueSource]))
  const displayProjects = projectList.map((project) => { const metric = latestByProject.get(project.id) ?? null; const source = metric?.source_id ? sourceById.get(metric.source_id) ?? null : null; return {...project,revenue:buildRevenueDisplay(metric,source),manualMetrics:(manualByProject.get(project.id) ?? []).filter((point) => point.metric_type === (project.primary_metric_type ?? 'users'))} })
  const verifiedTotal = displayProjects.reduce((sum,project) => project.revenue?.state === 'verified' ? sum + project.revenue.mrr : sum,0)
  const verifiedCount = displayProjects.filter((project) => project.revenue?.state === 'verified').length
  const initials = (profile.display_name ?? profile.username).split(/\s+/).map((part:string) => part[0]).join('').slice(0,2).toUpperCase()
  const links = Array.isArray(profile.links) ? profile.links as ProfileLink[] : []
  const bio = locale === 'ru' ? profile.bio_ru ?? profile.bio_en : profile.bio_en ?? profile.bio_ru

  return <main className={styles.page}>
    {ownerPreview && <div className={styles.previewBanner}><strong>{t.preview}</strong><span>{t.previewNote}</span><Link href="/dashboard/projects">← {t.dashboard}</Link></div>}
    <header className={styles.topbar}><Link href="/" className={styles.wordmark}><span>P</span>ProofPage</Link><div className={styles.topActions}><LocaleToggle/><button className={styles.share}>{t.share}</button></div></header>
    <div className={styles.layout}><aside className={styles.founder}>{profile.avatar_url ? <div className={styles.avatar} style={{backgroundImage:`url(${profile.avatar_url})`,backgroundSize:'cover'}} aria-label={profile.display_name ?? profile.username}/> : <div className={styles.avatar}>{initials}</div>}<p className={styles.kicker}>{t.founder}</p><h1>{profile.display_name ?? profile.username}</h1>{profile.location && <p className={styles.location}>{profile.location}</p>}{bio && <p className={styles.bio}>{bio}</p>}<div className={`${styles.totalCard} ${verifiedCount ? styles.totalVerified : styles.totalNeutral}`}><div className={styles.verifiedTitle}><span>{verifiedCount ? '✓' : '–'}</span>{verifiedCount ? t.total : t.noVerified}</div><strong>{formatMoney(verifiedTotal,'USD',locale)}<span>/month</span></strong><p>{t.across} {verifiedCount} {verifiedCount === 1 ? t.connectedOne : t.connectedMany}</p></div>{links.length > 0 && <nav className={styles.socials}>{links.map((link) => <a href={link.url} key={`${link.label}-${link.url}`} rel="noreferrer" target="_blank">{link.label} ↗</a>)}</nav>}<div className={styles.availability}><span/>{ownerPreview ? t.preview : t.public}</div></aside>
      <section className={styles.projects}><div className={styles.sectionHead}><div><p>{t.portfolio}</p><h2>{t.building}</h2></div><span>{displayProjects.length} {displayProjects.length === 1 ? t.project : t.projects}</span></div><div className={styles.projectList}>{displayProjects.length === 0 && <article className={styles.projectCard}><div className={styles.projectIdentity}><h3>{t.empty}</h3><p>{t.emptyText}</p></div></article>}{displayProjects.map((project,index) => { const verified = project.revenue?.state === 'verified'; const latestManual = project.manualMetrics.at(-1); const manualLabel = latestManual ? metricLabel(latestManual,locale) : null; return <article className={styles.projectCard} key={project.id}><div className={styles.cardTop}>{project.logo_url ? <Image className={styles.projectMark} src={project.logo_url} alt="" width={48} height={48} unoptimized/> : <div className={`${styles.projectMark} ${styles[`mark${(index%3)+1}`]}`}>{project.name[0]?.toUpperCase()}</div>}<div className={styles.projectIdentity}><div className={styles.nameRow}><h3>{project.name}</h3><span className={styles.status}>{statusLabels[locale][project.status as ProjectStatus]}</span></div><p>{locale === 'ru' ? project.description_ru ?? project.description_en ?? t.coming : project.description_en ?? project.description_ru ?? t.coming}</p></div>{project.url && <a className={styles.visit} href={project.url} rel="noreferrer" target="_blank">↗</a>}</div><div className={styles.metricRow}><div><span>{manualLabel ?? t.primary}</span><strong>{latestManual ? formatMetric(latestManual,locale) : project.revenue ? `${formatMoney(project.revenue.mrr,project.revenue.currency,locale)}/mo` : t.noData}</strong></div><div><span>{t.status}</span><strong className={verified ? styles.green : styles.grey}>{verified ? t.verified : t.unverified}</strong></div><div><span>{t.source}</span><strong>{verified && project.revenue?.provider ? project.revenue.provider : t.owner}</strong></div></div>{project.manualMetrics.length ? <MetricChart points={project.manualMetrics.map((point:ProjectMetric) => ({id:point.id,value:point.value,measured_at:point.measured_at}))} locale={locale}/> : <div className={`${styles.chart} ${styles[index%2 ? 'steady' : 'up']}`} aria-hidden="true"><span/></div>}<footer className={styles.cardFooter}><div className={verified ? styles.verifiedBadge : styles.unverifiedBadge}><span>{verified ? '✓' : '–'}</span>{verified ? t.revenueVerified : t.manual}</div><time>{latestManual ? formatDate(latestManual.measured_at,locale) : verified && project.revenue?.last_synced_at ? `${t.synced} ${formatDate(project.revenue.last_synced_at,locale)}` : t.noData}</time></footer></article>})}</div></section>
    </div><footer className={styles.brandFooter}><span>{t.built} <strong>ProofPage</strong></span><Link href="/signup">{t.create}</Link></footer>
  </main>
}

function formatMoney(value:number,currency:string,locale:'en'|'ru') { return new Intl.NumberFormat(locale,{style:'currency',currency:currency.toUpperCase(),notation:value>=10000?'compact':'standard',maximumFractionDigits:value>=10000?1:0}).format(value) }
function formatDate(value:string,locale:'en'|'ru') { const date = new Date(value); return isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'}).format(date) }
function metricLabel(metric:ProjectMetric,locale:'en'|'ru') { if(metric.metric_type==='custom') return (locale==='ru' ? metric.label_ru ?? metric.label_en : metric.label_en ?? metric.label_ru) ?? (locale==='ru'?'Показатель':'Metric'); const labels={users:['Users','Пользователи'],customers:['Customers','Клиенты'],signups:['Signups','Регистрации'],sales:['Sales','Продажи'],revenue:['Revenue','Выручка'],mrr:['MRR','MRR']} as const; return labels[metric.metric_type][locale==='ru'?1:0] }
function formatMetric(metric:ProjectMetric,locale:'en'|'ru') { const value=Number(metric.value).toLocaleString(locale,{maximumFractionDigits:2}); return `${value}${metric.currency?` ${metric.currency}`:metric.unit?` ${metric.unit}`:''}` }
