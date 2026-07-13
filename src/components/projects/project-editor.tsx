'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { deleteProject, updateProject, type ProjectActionState } from '@/app/actions/projects'
import type { Project, ProjectMetricType, ProjectStatus } from '@/types/database'
import { PRIMARY_METRICS, PROJECT_STATUSES } from '@/lib/projects/validation'
import styles from './project-editor.module.css'
import { useLocale } from '@/lib/i18n/use-locale'

const text = {
 en:{title:'Project settings',name:'Name',descEn:'Description in English',descRu:'Description in Russian',url:'Project URL',status:'Status',metric:'Primary public metric',public:'Show project publicly',logo:'Project logo',logoHelp:'PNG, JPEG or WebP · max 2 MB',save:'Save changes',preview:'Open public profile',danger:'Delete project',confirm:'Type DELETE to confirm',remove:'Delete permanently',states:{building:'Building',active:'Active',paused:'Paused',sold:'Sold',closed:'Closed'},metrics:{users:'Users',customers:'Customers',signups:'Signups',sales:'Sales',revenue:'Revenue',mrr:'MRR',custom:'Custom'}},
 ru:{title:'Настройки проекта',name:'Название',descEn:'Описание на английском',descRu:'Описание на русском',url:'Ссылка на проект',status:'Статус',metric:'Основной публичный показатель',public:'Показывать проект публично',logo:'Логотип проекта',logoHelp:'PNG, JPEG или WebP · до 2 МБ',save:'Сохранить изменения',preview:'Открыть публичный профиль',danger:'Удалить проект',confirm:'Введите DELETE для подтверждения',remove:'Удалить навсегда',states:{building:'Создаётся',active:'Активен',paused:'Приостановлен',sold:'Продан',closed:'Закрыт'},metrics:{users:'Пользователи',customers:'Клиенты',signups:'Регистрации',sales:'Продажи',revenue:'Выручка',mrr:'MRR',custom:'Свой показатель'}}
} as const

export function ProjectEditor({ project, username }: { project:Project; username:string }) {
 const { locale, setLocale } = useLocale(); const [state,action,pending]=useActionState<ProjectActionState,FormData>(updateProject,{}); const [confirm,setConfirm]=useState(''); const t=text[locale]
 return <section className={styles.card}><header><div><span>{t.title}</span><h2>{project.name}</h2></div><div className={styles.actions}><button type="button" onClick={()=>setLocale(locale==='en'?'ru':'en')}>{locale.toUpperCase()}</button><Link href={`/${username}?preview=1`} target="_blank">{t.preview} ↗</Link></div></header>
  <form action={action} className={styles.form} encType="multipart/form-data"><input type="hidden" name="project_id" value={project.id}/>
   <label>{t.name}<input name="name" defaultValue={project.name} required maxLength={100}/><Error text={state.fieldErrors?.name}/></label>
   <label>{t.url}<input name="url" type="url" defaultValue={project.url ?? ''} placeholder="https://"/><Error text={state.fieldErrors?.url}/></label>
   <label className={styles.full}>{t.descEn}<textarea name="description_en" defaultValue={project.description_en ?? ''} maxLength={1000}/><Error text={state.fieldErrors?.description_en}/></label>
   <label className={styles.full}>{t.descRu}<textarea name="description_ru" defaultValue={project.description_ru ?? ''} maxLength={1000}/><Error text={state.fieldErrors?.description_ru}/></label>
   <label>{t.status}<select name="status" defaultValue={project.status}>{PROJECT_STATUSES.map((x)=><option value={x} key={x}>{t.states[x as ProjectStatus]}</option>)}</select></label>
   <label>{t.metric}<select name="primary_metric_type" defaultValue={project.primary_metric_type ?? 'users'}>{PRIMARY_METRICS.map((x)=><option value={x} key={x}>{t.metrics[x as ProjectMetricType]}</option>)}</select></label>
   <label className={styles.full}>{t.logo}<input name="logo" type="file" accept="image/png,image/jpeg,image/webp"/><small>{t.logoHelp}</small><Error text={state.fieldErrors?.logo}/></label>
   <label className={`${styles.check} ${styles.full}`}><input name="is_public" type="checkbox" defaultChecked={project.is_public}/><span>{t.public}</span></label>
   <div className={styles.full}><button className={styles.save} disabled={pending}>{pending?'…':t.save}</button>{state.error&&<p className={styles.error}>{state.error}</p>}{state.success&&<p className={styles.success}>{state.success}</p>}</div>
  </form>
  <div className={styles.danger}><div><strong>{t.danger}</strong><p>{t.confirm}</p></div><form action={deleteProject}><input type="hidden" name="project_id" value={project.id}/><input name="confirmation" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="DELETE"/><button disabled={confirm!=='DELETE'}>{t.remove}</button></form></div>
 </section>
}
function Error({text}:{text?:string}){return text?<small className={styles.error}>{text}</small>:null}
