'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { completeOnboarding, checkUsername } from '@/app/actions/onboarding'
import type { OnboardingState } from '@/app/actions/onboarding'
import { LocaleToggle } from '@/components/locale-toggle'
import { useLocale } from '@/lib/i18n/use-locale'

const initialState: OnboardingState = {}
type Copy = typeof onboardingCopy.en | typeof onboardingCopy.ru
type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void

export default function OnboardingPage() {
  const { locale } = useLocale()
  const t = onboardingCopy[locale]
  const [step, setStep] = useState(0)
  const [fields, setFields] = useState({ username: '', display_name: '', location: '', bio: '', project_name: '', project_status: 'building', project_url: '', project_description: '' })
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameMsg, setUsernameMsg] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [state, formAction, submitting] = useActionState(completeOnboarding, initialState)
  const [, startTransition] = useTransition()

  const errorStep = state.fieldErrors?.username ? 0 : state.fieldErrors?.display_name ? 1 : state.fieldErrors?.project_name ? 2 : null
  if (errorStep !== null && errorStep !== step && !submitting) setStep(errorStep)

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setFields((previous) => ({ ...previous, [name]: value }))
    if (name !== 'username') return
    setUsernameStatus('checking'); setUsernameMsg('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => startTransition(async () => {
      const result = await checkUsername(value)
      if (result.error) { setUsernameStatus('invalid'); setUsernameMsg(result.error) }
      else if (result.available) { setUsernameStatus('available'); setUsernameMsg(t.available) }
      else { setUsernameStatus('taken'); setUsernameMsg(t.taken) }
    }), 400)
  }

  const canProceed = step === 0 ? fields.username.length >= 3 && usernameStatus === 'available' : step === 1 ? fields.display_name.trim().length > 0 : step === 2 ? fields.project_name.trim().length > 0 : true
  const globalError = state.error && !state.fieldErrors

  return <main className="onboarding-page">
    <header className="onboarding-header"><Link href="/" className="brand"><span className="brand-mark">P</span>ProofPage</Link><div><LocaleToggle/><Link href="/">{t.exit}</Link></div></header>
    <section className="onboarding-stage">
      <div className="step-track" aria-label={`${t.step} ${step + 1} ${t.of} ${t.steps.length}`}>{t.steps.map((label, index) => <div className={index <= step ? 'active' : ''} key={label}><span>{index < step ? '✓' : index + 1}</span><strong>{label}</strong></div>)}</div>
      {globalError && <p role="alert" className="onboarding-alert">{state.error}</p>}
      <form action={formAction}>
        {Object.entries(fields).map(([name, value]) => <input type="hidden" name={name} value={value} key={name}/>)}
        <div className="onboarding-card"><p className="onboarding-eyebrow">{t.step} {step + 1} {t.of} 4</p>
          {step === 0 && <StepAddress t={t} value={fields.username} onChange={handleChange} status={usernameStatus} statusMsg={usernameMsg} serverError={state.fieldErrors?.username}/>}
          {step === 1 && <StepProfile t={t} displayName={fields.display_name} location={fields.location} bio={fields.bio} onChange={handleChange} serverError={state.fieldErrors?.display_name}/>}
          {step === 2 && <StepProject t={t} name={fields.project_name} status={fields.project_status} url={fields.project_url} description={fields.project_description} onChange={handleChange} serverError={state.fieldErrors?.project_name}/>}
          {step === 3 && <StepPublish t={t}/>}
          <div className="onboarding-actions"><button type="button" className="back" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>{t.back}</button>{step < 3 ? <button type="button" className="next" disabled={!canProceed} onClick={() => setStep((value) => value + 1)}>{t.continue} →</button> : <button type="submit" className="next coral" disabled={submitting}>{submitting ? t.publishing : t.publish}</button>}</div>
        </div>
      </form>
    </section>
  </main>
}

function Heading({ title, text }: { title: string; text: string }) { return <><h1 className="onboarding-title">{title}</h1><p className="onboarding-intro">{text}</p></> }

function StepAddress({ t, value, onChange, status, statusMsg, serverError }: { t: Copy; value: string; onChange: ChangeHandler; status: string; statusMsg: string; serverError?: string }) {
  const error = serverError ?? (status === 'taken' || status === 'invalid' ? statusMsg : '')
  const available = status === 'available'
  return <div><Heading title={t.addressTitle} text={t.addressText}/><label className="onboarding-label">{t.address}<div className={`address-field ${error ? 'error' : available ? 'success' : ''}`}><span>proofpage.io/</span><input name="username" placeholder={t.addressPlaceholder} value={value} onChange={onChange} autoComplete="off" spellCheck={false}/></div></label>{error ? <p className="field-error">{error}</p> : available ? <p className="field-success">{statusMsg}</p> : status === 'checking' ? <p className="field-help">{t.checking}</p> : <p className="field-help">{t.addressHelp}</p>}</div>
}

function StepProfile({ t, displayName, location, bio, onChange, serverError }: { t: Copy; displayName: string; location: string; bio: string; onChange: ChangeHandler; serverError?: string }) {
  return <div><Heading title={t.profileTitle} text={t.profileText}/><div className="onboarding-grid"><label className="onboarding-label">{t.displayName}<input className={`onboarding-field ${serverError ? 'error' : ''}`} name="display_name" placeholder={t.namePlaceholder} value={displayName} onChange={onChange}/>{serverError && <span className="field-error">{serverError}</span>}</label><label className="onboarding-label">{t.location}<input className="onboarding-field" name="location" placeholder={t.locationPlaceholder} value={location} onChange={onChange}/></label><label className="onboarding-label full">{t.bio}<textarea className="onboarding-field textarea" name="bio" placeholder={t.bioPlaceholder} value={bio} onChange={onChange}/></label></div></div>
}

function StepProject({ t, name, status, url, description, onChange, serverError }: { t: Copy; name: string; status: string; url: string; description: string; onChange: ChangeHandler; serverError?: string }) {
  return <div><Heading title={t.projectTitle} text={t.projectText}/><div className="onboarding-grid"><label className="onboarding-label">{t.projectName}<input className={`onboarding-field ${serverError ? 'error' : ''}`} name="project_name" placeholder="SignalDesk" value={name} onChange={onChange}/>{serverError && <span className="field-error">{serverError}</span>}</label><label className="onboarding-label">{t.status}<select className="onboarding-field" name="project_status" value={status} onChange={onChange}><option value="active">{t.states.active}</option><option value="building">{t.states.building}</option><option value="paused">{t.states.paused}</option><option value="sold">{t.states.sold}</option><option value="closed">{t.states.closed}</option></select></label><label className="onboarding-label full">{t.website}<input className="onboarding-field" type="url" name="project_url" placeholder="https://example.com" value={url} onChange={onChange}/></label><label className="onboarding-label full">{t.description}<textarea className="onboarding-field textarea" name="project_description" placeholder={t.descriptionPlaceholder} value={description} onChange={onChange}/></label></div></div>
}

function StepPublish({ t }: { t: Copy }) { return <div><Heading title={t.publishTitle} text={t.publishText}/><div className="publish-ready"><span>✓</span><div><strong>{t.ready}</strong><p>{t.readyDetail}</p></div></div><div className="revenue-note"><strong>{t.revenueNote}</strong><p>{t.revenueText}</p></div></div> }

const onboardingCopy = {
  en: { exit:'Save and exit', step:'Step', of:'of', steps:['Address','Profile','Project','Publish'], back:'Back', continue:'Continue', publishing:'Publishing…', publish:'Publish ProofPage', available:'This address is available', taken:'This address is already taken', checking:'Checking…', addressHelp:'3–30 characters. Lowercase letters, numbers, and hyphens.', addressTitle:'Claim your address', addressText:'Choose the short link you will share with customers, partners, and other founders.', address:'Public address', addressPlaceholder:'yourname', profileTitle:'Introduce yourself', profileText:'Visitors should understand who you are and what you build in a few seconds.', displayName:'Display name', namePlaceholder:'Alex Morgan', location:'Location', locationPlaceholder:'Tallinn, Estonia', bio:'Short bio', bioPlaceholder:'Independent founder building useful software.', projectTitle:'Add your first project', projectText:'Free includes one public project. Pro adds more projects and verified sources.', projectName:'Project name', status:'Status', website:'Website', description:'Description', descriptionPlaceholder:'What does your project help people do?', states:{active:'Active',building:'Building',paused:'Paused',sold:'Sold',closed:'Closed'}, publishTitle:'Ready to go public', publishText:'Review your information and publish your first ProofPage. You can edit everything later.', ready:'Your free page is ready', readyDetail:'One profile · One project · Base theme', revenueNote:'A note about revenue', revenueText:'Manual revenue is always displayed as Unverified. Verified Revenue requires Pro and a supported read-only source.' },
  ru: { exit:'Сохранить и выйти', step:'Шаг', of:'из', steps:['Адрес','Профиль','Проект','Публикация'], back:'Назад', continue:'Продолжить', publishing:'Публикуем…', publish:'Опубликовать ProofPage', available:'Этот адрес свободен', taken:'Этот адрес уже занят', checking:'Проверяем…', addressHelp:'3–30 символов: строчные буквы, цифры и дефисы.', addressTitle:'Займите свой адрес', addressText:'Выберите короткую ссылку для клиентов, партнёров и других основателей.', address:'Публичный адрес', addressPlaceholder:'ваше-имя', profileTitle:'Расскажите о себе', profileText:'Посетители должны за несколько секунд понять, кто вы и что создаёте.', displayName:'Отображаемое имя', namePlaceholder:'Алекс Морозов', location:'Город', locationPlaceholder:'Таллин, Эстония', bio:'Короткое описание', bioPlaceholder:'Независимый основатель, создаю полезные продукты.', projectTitle:'Добавьте первый проект', projectText:'Free включает один публичный проект. Pro добавляет проекты и подтверждённые источники.', projectName:'Название проекта', status:'Статус', website:'Сайт', description:'Описание', descriptionPlaceholder:'Какую задачу решает ваш проект?', states:{active:'Активен',building:'Создаётся',paused:'Приостановлен',sold:'Продан',closed:'Закрыт'}, publishTitle:'Готово к публикации', publishText:'Проверьте данные и опубликуйте первую ProofPage. Всё можно изменить позже.', ready:'Ваша бесплатная страница готова', readyDetail:'Один профиль · Один проект · Базовая тема', revenueNote:'О выручке', revenueText:'Ручная выручка всегда помечается как «Не подтверждено». Для Verified Revenue нужен Pro и поддерживаемый read-only источник.' },
} as const
