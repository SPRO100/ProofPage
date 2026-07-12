'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { addManualMetric, deleteManualMetric, type MetricActionState } from '@/app/actions/metrics'
import type { Project, ProjectMetric, ProjectMetricType } from '@/types/database'
import { MetricChart } from './metric-chart'
import dashboardStyles from '@/app/dashboard/dashboard.module.css'
import metricStyles from './metrics-manager.module.css'

const styles = { ...dashboardStyles, ...metricStyles }

const labels = {
  en: { add:'Add metric point', project:'Project', type:'Metric', value:'Value', date:'Date', currency:'Currency', custom:'Custom label', save:'Save unverified point', manual:'Owner entered · Unverified', empty:'No metric history yet.', delete:'Delete', types:{users:'Users',customers:'Customers',signups:'Signups',sales:'Sales',revenue:'Revenue',mrr:'MRR',custom:'Custom'} },
  ru: { add:'Добавить показатель', project:'Проект', type:'Показатель', value:'Значение', date:'Дата', currency:'Валюта', custom:'Название показателя', save:'Сохранить без подтверждения', manual:'Введено владельцем · Не подтверждено', empty:'История показателей пока пуста.', delete:'Удалить', types:{users:'Пользователи',customers:'Клиенты',signups:'Регистрации',sales:'Продажи',revenue:'Выручка',mrr:'MRR',custom:'Свой показатель'} },
} as const
const types: ProjectMetricType[] = ['users','customers','signups','sales','revenue','mrr','custom']

export function MetricsManager({ projects, metrics }: { projects: Project[]; metrics: ProjectMetric[] }) {
  const [locale, setLocale] = useState<'en'|'ru'>('en')
  const [state, action, pending] = useActionState<MetricActionState, FormData>(addManualMetric, {})
  const [selectedType, setSelectedType] = useState<ProjectMetricType>('users')
  const [maxDate] = useState(() => new Date(Date.now() + 86_400_000).toISOString().slice(0, 16))
  useEffect(() => { const saved = localStorage.getItem('proofpage-locale'); if (saved === 'ru') queueMicrotask(() => setLocale('ru')) }, [])
  const t = labels[locale]
  const grouped = useMemo(() => new Map(projects.map((p) => [p.id, metrics.filter((m) => m.project_id === p.id)])), [metrics, projects])

  return <>
    <section className={styles.metricFormPanel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>{t.add}</p><h2>{t.add}</h2></div><div className={styles.miniLocale}><button type="button" className={locale === 'en' ? styles.selected : ''} onClick={() => setLocale('en')}>EN</button><button type="button" className={locale === 'ru' ? styles.selected : ''} onClick={() => setLocale('ru')}>RU</button></div></div>
      {projects.length === 0 ? <p className={styles.bodyText}>{locale === 'ru' ? 'Сначала создайте проект в онбординге.' : 'Create your first project during onboarding.'}</p> : <form action={action} className={styles.metricForm}>
        <label>{t.project}<select name="project_id" required>{projects.map((p)=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
        <label>{t.type}<select name="metric_type" value={selectedType} onChange={(e)=>setSelectedType(e.target.value as ProjectMetricType)}>{types.map((type)=><option value={type} key={type}>{t.types[type]}</option>)}</select></label>
        <label>{t.value}<input name="value" type="number" min="0" max="999999999999" step="0.01" required/></label>
        <label>{t.date}<input name="measured_at" type="datetime-local" max={maxDate} required/></label>
        {(selectedType === 'revenue' || selectedType === 'mrr') && <label>{t.currency}<select name="currency" defaultValue="USD"><option>USD</option><option>EUR</option><option>RUB</option><option>GBP</option></select></label>}
        {selectedType === 'custom' && <><label>{t.custom} (EN)<input name="label_en" maxLength={60}/></label><label>{t.custom} (RU)<input name="label_ru" maxLength={60}/></label></>}
        <button className={styles.primaryButton} disabled={pending}>{pending ? '…' : t.save}</button>
        {state.error && <p className={styles.formError}>{state.error}</p>}{state.success && <p className={styles.formSuccess}>{state.success}</p>}
      </form>}
    </section>
    <section className={styles.metricProjects}>{projects.map((project) => { const points = grouped.get(project.id) ?? []; const latest = points.at(-1); return <article className={styles.metricProjectCard} key={project.id}><header><div className={styles.projectIcon}>{project.name[0]?.toUpperCase()}</div><div><h2>{project.name}</h2><p>{project.description_en ?? project.description_ru ?? ''}</p></div><span className={styles.unverifiedPill}>{t.manual}</span></header>{latest ? <><div className={styles.latestMetric}><span>{t.types[latest.metric_type]}</span><strong>{Number(latest.value).toLocaleString(locale)}{latest.currency ? ` ${latest.currency}` : latest.unit ? ` ${latest.unit}` : ''}</strong><small>{new Intl.DateTimeFormat(locale,{dateStyle:'medium'}).format(new Date(latest.measured_at))}</small></div><MetricChart points={points.map((p)=>({id:p.id,value:p.value,measured_at:p.measured_at}))} locale={locale}/><div className={styles.metricHistory}>{[...points].reverse().slice(0,8).map((point)=><div key={point.id}><span>{new Intl.DateTimeFormat(locale,{dateStyle:'medium'}).format(new Date(point.measured_at))}</span><strong>{Number(point.value).toLocaleString(locale)} {point.currency ?? point.unit ?? ''}</strong><form action={deleteManualMetric}><input type="hidden" name="metric_id" value={point.id}/><button aria-label={`${t.delete} ${point.value}`}>{t.delete}</button></form></div>)}</div></> : <div className={styles.metricEmpty}>{t.empty}</div>}</article>})}</section>
  </>
}
