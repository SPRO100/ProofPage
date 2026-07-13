/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Locale = "en" | "ru";

const copy = {
  en: {
    nav: ["How it works", "Proof profile", "Pricing"], login: "Log in", create: "Create your ProofPage",
    gateTitle: "Choose your language", gateText: "You can change it later in the header.",
    kicker: "Build in public · with receipts", titleLead: "Show the work.", titleAccent: "Prove the numbers.", titleTail: "Build real trust.",
    intro: "ProofPage turns your projects, progress, and verified revenue into one public proof profile people can understand in seconds.",
    example: "See a proof profile", address: "your-name", claim: "Claim address",
    widgetLabel: "LIVE PROOF", widgetProject: "SignalDesk", widgetDetail: "Customer feedback for focused teams", verified: "Revenue verified", provider: "Stripe · read-only", mrr: "$12.4k MRR", synced: "Synced 8 min ago",
    why: "Proof over promises", whyTitle: "A public page that earns confidence before the first call.",
    benefits: [["Show the work", "Put your founder story, products, links, and milestones in one focused profile."], ["Verify what matters", "Connected revenue gets a clear source, period, and last-sync timestamp."], ["Share one proof link", "Use it in launches, bios, pitches, applications, and customer conversations."]],
    how: "How it works", steps: [["Shape your profile", "Tell people who you are and why the work matters."], ["Add honest evidence", "Share milestones manually or connect a read-only source with Pro."], ["Publish with context", "Give every number a source and every project a clear story."]],
    strip: "Build in public without turning trust into theatre.", stripItems: [["1 proof profile", "A memorable home for your work"], ["Private editing", "Publish when the context is ready"], ["Clear provenance", "Verified and owner-entered never look the same"]],
    pricing: "Straightforward pricing", pricingTitle: "Start with proof. Upgrade for verification.", freeDesc: "For one founder and one public project.",
    freeItems: ["One profile and one project", "Base proof-profile theme", "Social links", "Manual revenue marked Unverified", "Basic view count"],
    proDesc: "For a growing portfolio with connected proof.", proItems: ["Multiple projects", "Additional themes", "Read-only revenue connections", "Verified Revenue badge", "Charts, history, and analytics"], soon: "Coming after security review", start: "Start free", current: "Available now", proCta: "Pro is not purchasable yet",
    final: "Let the work speak. Give it proof.", footer: ["Product", "Trust model", "Privacy", "Contact"], doodle: "context → source → trust", proofDoodle: "proof > promises", perMonth: "/month",
  },
  ru: {
    nav: ["Как это работает", "Proof‑профиль", "Тарифы"], login: "Войти", create: "Создать ProofPage",
    gateTitle: "Выберите язык", gateText: "Язык всегда можно изменить в шапке.",
    kicker: "Стройте публично · подтверждайте фактами", titleLead: "Покажите работу.", titleAccent: "Подтвердите цифры.", titleTail: "Создайте доверие.",
    intro: "ProofPage собирает проекты, прогресс и подтверждённую выручку в одном публичном proof‑профиле, который понятен за несколько секунд.",
    example: "Посмотреть proof‑профиль", address: "ваше-имя", claim: "Занять адрес",
    widgetLabel: "ЖИВОЕ ДОКАЗАТЕЛЬСТВО", widgetProject: "SignalDesk", widgetDetail: "Отзывы клиентов для сфокусированных команд", verified: "Выручка подтверждена", provider: "Stripe · только чтение", mrr: "$12,4 тыс. MRR", synced: "Обновлено 8 мин назад",
    why: "Факты вместо обещаний", whyTitle: "Публичная страница, которая создаёт доверие до первого разговора.",
    benefits: [["Покажите работу", "Соберите историю основателя, продукты, ссылки и этапы в одном профиле."], ["Подтвердите главное", "У подключённой выручки всегда видны источник, период и время синхронизации."], ["Делитесь одной ссылкой", "Добавляйте её в запуски, соцсети, презентации и разговоры с клиентами."]],
    how: "Как это работает", steps: [["Оформите профиль", "Расскажите, кто вы и почему эта работа важна."], ["Добавьте честные данные", "Покажите прогресс вручную или подключите read-only источник на Pro."], ["Публикуйте с контекстом", "У каждой цифры есть источник, у каждого проекта — ясная история."]],
    strip: "Стройте публично, не превращая доверие в спектакль.", stripItems: [["1 proof‑профиль", "Запоминающийся адрес для вашей работы"], ["Приватное редактирование", "Публикуйте, когда контекст готов"], ["Понятный источник", "Подтверждённые и ручные данные выглядят по-разному"]],
    pricing: "Честные тарифы", pricingTitle: "Начните с proof. Платите за верификацию.", freeDesc: "Для одного основателя и одного публичного проекта.",
    freeItems: ["Один профиль и один проект", "Базовая тема proof‑профиля", "Ссылки на соцсети", "Ручная выручка с пометкой «Не подтверждено»", "Базовый счётчик просмотров"],
    proDesc: "Для растущего портфолио с подключёнными источниками.", proItems: ["Несколько проектов", "Дополнительные темы", "Read-only подключения выручки", "Значок «Выручка подтверждена»", "Графики, история и аналитика"], soon: "После аудита безопасности", start: "Начать бесплатно", current: "Доступно сейчас", proCta: "Pro пока нельзя купить",
    final: "Пусть работа говорит. Добавьте доказательства.", footer: ["Продукт", "Модель доверия", "Конфиденциальность", "Контакты"], doodle: "контекст → источник → доверие", proofDoodle: "факты > обещания", perMonth: "/месяц",
  },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<Locale | null>(null);
  useEffect(() => { const saved = localStorage.getItem("proofpage-locale"); if (saved === "en" || saved === "ru") queueMicrotask(() => setLocale(saved)); }, []);
  const choose = (next: Locale) => { localStorage.setItem("proofpage-locale", next); document.cookie = `proofpage-locale=${next}; path=/; max-age=31536000; samesite=lax`; document.documentElement.lang = next; setLocale(next); };

  if (!locale) return <main className="language-screen"><section className="language-card"><Brand /><div className="language-spark" aria-hidden="true">✦</div><h1>{copy.en.gateTitle}<br/><span>{copy.ru.gateTitle}</span></h1><p>{copy.en.gateText}<br/>{copy.ru.gateText}</p><div className="language-options"><button onClick={() => choose("en")}>English <span>→</span></button><button onClick={() => choose("ru")}>Русский <span>→</span></button></div></section></main>;

  const t = copy[locale];
  return <main className="paper-site">
    <nav className="nav shell"><a href="#top"><Brand /></a><div className="nav-links"><a href="#how">{t.nav[0]}</a><a href="/demo-founder">{t.nav[1]}</a><a href="#pricing">{t.nav[2]}</a></div><div className="nav-actions"><LocaleSwitch locale={locale} choose={choose}/><Link className="login-link" href="/login">{t.login}</Link><Link className="button primary nav-cta" href="/signup">{t.create}</Link></div></nav>

    <section id="top" className="hero shell">
      <div className="hero-copy"><p className="eyebrow coral">{t.kicker}</p><h1><span>{t.titleLead}</span><em>{t.titleAccent}</em><span>{t.titleTail}</span></h1><p className="hero-intro">{t.intro}</p><div className="button-row"><Link className="button primary" href="/signup">{t.create}</Link><Link className="button secondary" href="/demo-founder">{t.example}</Link></div><div className="address"><span>proofpage.io/</span><strong>{t.address}</strong><Link href="/signup">{t.claim}</Link></div></div>
      <div className="hero-demo" id="example">
        <p className="doodle doodle-top">{t.doodle}</p>
        <div className="robot-wrap"><Image src="/images/proofpage-robot.png" alt="" width={360} height={360} priority /></div>
        <article className="proof-widget"><header><span className="widget-label">{t.widgetLabel}</span><span className="live-dot">●</span></header><div className="widget-project"><div className="project-mark">S</div><div><h2>{t.widgetProject}</h2><p>{t.widgetDetail}</p></div><span className="visit-arrow">↗</span></div><div className="revenue-proof"><div><span>{t.verified}</span><strong>{t.mrr}</strong></div><span className="verified-badge">✓ {t.verified}</span></div><footer><span>{t.provider}</span><time>{t.synced}</time></footer></article>
        <svg className="doodle-arrow" viewBox="0 0 130 85" aria-hidden="true"><path d="M8 10c54 2 78 24 88 56M84 53l13 15 10-19"/></svg>
      </div>
    </section>

    <section id="how" className="section shell"><p className="eyebrow">{t.why}</p><h2>{t.whyTitle}</h2><div className="feature-grid">{t.benefits.map((item, i)=><article className={i === 1 ? "feature-card dark-feature" : "feature-card"} key={item[0]}><span>0{i+1}</span><div className={`feature-icon fi-${i+1}`} aria-hidden="true">{i === 0 ? "↗" : i === 1 ? "✓" : "∞"}</div><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div><div className="steps"><p className="eyebrow">{t.how}</p>{t.steps.map((item,i)=><article key={item[0]}><b>0{i+1}</b><div><h3>{item[0]}</h3><p>{item[1]}</p></div></article>)}</div></section>

    <section className="proof-strip"><div className="shell"><h2>{t.strip}</h2><div>{t.stripItems.map(item=><article key={item[0]}><strong>{item[0]}</strong><span>{item[1]}</span></article>)}</div></div></section>

    <section id="pricing" className="section pricing shell"><p className="eyebrow coral">{t.pricing}</p><h2>{t.pricingTitle}</h2><div className="pricing-grid"><article><span className="plan-kicker">{t.current}</span><h3>Free</h3><div className="price">$0</div><p>{t.freeDesc}</p><ul>{t.freeItems.map(item=><li key={item}><span>✓</span>{item}</li>)}</ul><Link className="button primary" href="/signup">{t.start}</Link></article><article className="pro"><span className="plan-kicker butter">{t.soon}</span><h3>Pro</h3><div className="price">$9<small>{t.perMonth}</small></div><p>{t.proDesc}</p><ul>{t.proItems.map(item=><li key={item}><span>○</span>{item}</li>)}</ul><button className="button disabled" disabled>{t.proCta}</button></article></div></section>

    <section className="final-cta shell"><div><p className="doodle">{t.proofDoodle}</p><h2>{t.final}</h2></div><Link className="button coral-button" href="/signup">{t.create}</Link></section>
    <footer className="shell"><div><Brand /><p>© 2026 ProofPage</p></div><div>{t.footer.map(item=><a href="#" key={item}>{item}</a>)}</div></footer>
  </main>;
}

function Brand() { return <span className="brand"><span className="brand-mark">P</span>ProofPage</span>; }
function LocaleSwitch({ locale, choose }: { locale: Locale; choose: (locale: Locale) => void }) { return <div className="locale-switch" aria-label={locale === "ru" ? "Язык" : "Language"}><button className={locale === "ru" ? "active" : ""} onClick={() => choose("ru")}>RU</button><button className={locale === "en" ? "active" : ""} onClick={() => choose("en")}>EN</button></div>; }
