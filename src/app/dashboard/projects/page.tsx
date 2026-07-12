import { createClient } from '@/lib/supabase/server'
import { requireProfile } from '@/lib/auth/helpers'
import type { Project, ProjectMetric } from '@/types/database'
import { MetricsManager } from '@/components/metrics/metrics-manager'
import { ProjectEditor } from '@/components/projects/project-editor'
import styles from '../dashboard.module.css'

export default async function ProjectsPage() {
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*').eq('profile_id', profile.id).order('sort_order')
  const list = (projects ?? []) as Project[]
  const ids = list.map((p) => p.id)
  const { data: metrics } = ids.length ? await supabase.from('project_metrics').select('*').in('project_id', ids).order('measured_at', { ascending: true }) : { data: [] }

  return <main className={styles.content}>
    <div className={styles.pageHead}><div><p className={styles.eyebrow}>Projects · Проекты</p><h1>Metrics that tell the story.</h1><p>Add historical points manually. They are always shown as unverified.</p></div><button className={styles.disabledButton} disabled>+ Add project</button></div>
    {list.map((project) => <ProjectEditor project={project} username={profile.username} key={project.id}/>)}
    <MetricsManager projects={list} metrics={(metrics ?? []) as ProjectMetric[]} />
    {profile.plan === 'free' && <section className={styles.limitCard}><div className={styles.lock}>◇</div><div><p className={styles.eyebrow}>Free plan · Бесплатный тариф</p><h2>One project, full metric history.</h2><p>You can add as many historical points as needed to your first project. Additional projects will become available with Pro.</p></div><button className={styles.disabledButton} disabled>Pro · Soon</button></section>}
  </main>
}
