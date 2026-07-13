import Link from 'next/link'
import { cookies } from 'next/headers'

const copy = {
  en: { eyebrow:'404 · Profile unavailable', title:"There's no public proof here yet.", text:'The address may be incorrect, or the founder may still be preparing their page.', back:'Back to ProofPage', claim:'Claim your address' },
  ru: { eyebrow:'404 · Профиль недоступен', title:'Публичных доказательств здесь пока нет.', text:'Возможно, адрес указан неверно или основатель ещё готовит страницу.', back:'Вернуться в ProofPage', claim:'Занять свой адрес' },
} as const

export default async function ProfileNotFound() {
  const locale = (await cookies()).get('proofpage-locale')?.value === 'ru' ? 'ru' : 'en'; const t = copy[locale]
  return <main className="grid min-h-screen place-items-center bg-[var(--canvas)] p-6 text-[var(--ink)]"><section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--stone)] bg-white p-10 text-center shadow-[var(--shadow-lift)]"><div className="mx-auto inline-flex items-center gap-2 font-extrabold"><span className="grid size-9 place-items-center rounded-full bg-[var(--ink)] text-xs text-white">P</span>ProofPage</div><p className="mt-16 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--coral)]">{t.eyebrow}</p><h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl leading-tight uppercase tracking-wide sm:text-5xl">{t.title}</h1><p className="mx-auto mt-6 max-w-md leading-7 text-[var(--slate)]">{t.text}</p><div className="mt-10 flex flex-wrap justify-center gap-3"><Link className="rounded-lg bg-[var(--ink)] px-6 py-3 font-bold text-white" href="/">{t.back}</Link><Link className="rounded-lg border border-[var(--stone)] px-6 py-3 font-bold" href="/signup">{t.claim}</Link></div></section></main>
}
