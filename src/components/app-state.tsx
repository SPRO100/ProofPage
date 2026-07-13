'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/use-locale'

const copy = {
  en: { loading:'Loading your proof…', loadingText:'Checking the latest profile and project data.', error:'We could not load this page.', errorText:'Your data is safe. Try the request again or return to a known page.', retry:'Try again', home:'Back to ProofPage', dashboard:'Back to dashboard' },
  ru: { loading:'Загружаем ваши доказательства…', loadingText:'Проверяем актуальные данные профиля и проектов.', error:'Не удалось загрузить страницу.', errorText:'Данные в безопасности. Повторите запрос или вернитесь на знакомую страницу.', retry:'Попробовать снова', home:'Вернуться в ProofPage', dashboard:'Вернуться в кабинет' },
} as const

export function AppLoading() { const { locale } = useLocale(); const t = copy[locale]; return <main className="state-page"><section className="state-card" aria-live="polite"><span className="state-icon state-icon--loading">↻</span><p className="state-eyebrow">ProofPage</p><h1>{t.loading}</h1><p>{t.loadingText}</p><div className="state-skeleton"><span/><span/><span/></div></section></main> }

export function AppError({ reset, dashboard = false }: { reset: () => void; dashboard?: boolean }) { const { locale } = useLocale(); const t = copy[locale]; return <main className="state-page"><section className="state-card"><span className="state-icon state-icon--error">!</span><p className="state-eyebrow">ProofPage</p><h1>{t.error}</h1><p>{t.errorText}</p><div className="state-actions"><button onClick={reset}>{t.retry}</button><Link href={dashboard ? '/dashboard' : '/'}>{dashboard ? t.dashboard : t.home}</Link></div></section></main> }
