import { createClient } from '@/lib/supabase/server'
import { requireProfile } from '@/lib/auth/helpers'
import type { Project, ProjectMetric } from '@/types/database'
import { MetricsManager } from '@/components/metrics/metrics-manager'
import { ProjectEditor } from '@/components/projects/project-editor'
import styles from '../dashboard.module.css'
import { cookies } from 'next/headers'

export default async function ProjectsPage() {
  const locale = (await cookies()).get('proofpage-locale')?.value === 'ru' ? 'ru' : 'en'
  const t = copy[locale]
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*').eq('profile_id', profile.id).order('sort_order')
  const list = (projects ?? []) as Project[]
  const ids = list.map((p) => p.id)
  const { data: metrics } = ids.length ? await supabase.from('project_metrics').select('*').in('project_id', ids).order('measured_at', { ascending: true }) : { data: [] }

  return <main className={styles.content}>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></div><button className={styles.disabledButton} disabled>{t.add}</button></div>
    {list.map((project) => <ProjectEditor project={project} username={profile.username} key={project.id}/>)}
    <MetricsManager projects={list} metrics={(metrics ?? []) as ProjectMetric[]} />
    {profile.plan === 'free' && <section className={styles.limitCard}><div className={styles.lock}>◇</div><div><p className={styles.eyebrow}>{t.free}</p><h2>{t.limitTitle}</h2><p>{t.limitText}</p></div><button className={styles.disabledButton} disabled>{t.soon}</button></section>}
  </main>
}

const copy = {
  en: { eyebrow:'Projects', title:'Metrics that tell the story.', intro:'Add historical points manually. They are always shown as Unverified.', add:'+ Add project · Pro', free:'Free plan', limitTitle:'One project, full metric history.', limitText:'Add as many historical points as needed to your first project. Additional projects will become available with Pro.', soon:'Pro · Coming soon' },
  ru: { eyebrow:'Проекты', title:'Метрики, которые рассказывают историю.', intro:'Добавляйте историю вручную. Эти данные всегда помечены как «Не подтверждено».', add:'+ Добавить проект · Pro', free:'Тариф Free', limitTitle:'Один проект, полная история метрик.', limitText:'Добавляйте сколько угодно точек для первого проекта. Дополнительные проекты появятся с Pro.', soon:'Pro · Скоро' },
} as const
