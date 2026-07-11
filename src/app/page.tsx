/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Locale = "en" | "ru";

const copy = {
  en: {
    nav: ["How it works", "Profile example", "Pricing"], login: "Log in", create: "Create a page",
    kicker: "One page for everything you build",
    title: "Everything you build. One page that speaks for you.",
    intro: "Bring your projects, milestones, and real results into a public profile people can trust.",
    example: "View example", address: "your-name", claim: "Claim address",
    founder: "Ivan Petrov", role: "Product engineer · Building SaaS tools", demo: "Demo data",
    projects: [
      { name: "Productly", desc: "Product analytics for indie teams", value: "1,240 users", change: "+12.8% in 30 days" },
      { name: "CartBoost", desc: "Upsell tools for online stores", value: "312 active stores", change: "+18% in 30 days" },
    ],
    why: "Why ProofPage", whyTitle: "A public profile built around proof, not promises.",
    benefits: [["Show what matters", "Projects, descriptions, links and results — together in one place."], ["Build trust", "A clear profile helps clients and partners understand your work faster."], ["Share one link", "Use ProofPage in social bios, emails, resumes and pitches."]],
    how: "How it works", steps: [["Create your profile", "Add your name, photo and short introduction."], ["Add your first project", "Share a link, description and manual metrics."], ["Publish and share", "Use one memorable address everywhere."]],
    strip: "One link. Every project. More trust.", stripItems: [["1 public page", "A focused home for your work"], ["1 free project", "Start without a card"], ["Manual metrics", "Always labelled clearly"]],
    pricing: "Pricing", pricingTitle: "Start free. Grow when Pro is ready.", freeDesc: "Everything you need for your first public project.",
    freeItems: ["One public profile", "One project", "Base theme", "Manual metrics marked unverified"], proDesc: "More room and advanced tools for growing founders.",
    proItems: ["Multiple projects", "Additional themes", "Advanced analytics", "Custom domain"], soon: "Coming soon", start: "Start free",
    final: "Give your work more than another link in bio.", footer: ["Product", "Legal", "Privacy", "Contact"],
  },
  ru: {
    nav: ["Как это работает", "Пример профиля", "Тарифы"], login: "Войти", create: "Создать страницу",
    kicker: "Одна страница для всего, что вы создаёте",
    title: "Все ваши проекты. Одна страница, которая говорит за вас.",
    intro: "Соберите проекты, достижения и реальные результаты в публичном профиле, которому доверяют.",
    example: "Посмотреть пример", address: "ваше-имя", claim: "Занять адрес",
    founder: "Иван Петров", role: "Продуктовый инженер · Создаю SaaS-инструменты", demo: "Демонстрационные данные",
    projects: [
      { name: "Productly", desc: "Аналитика продукта для инди-команд", value: "1 240 пользователей", change: "+12,8% за 30 дней" },
      { name: "CartBoost", desc: "Инструменты допродаж для интернет-магазинов", value: "312 активных магазинов", change: "+18% за 30 дней" },
    ],
    why: "Почему ProofPage", whyTitle: "Публичный профиль, построенный на результатах, а не обещаниях.",
    benefits: [["Покажите главное", "Проекты, описания, ссылки и результаты собраны в одном месте."], ["Создайте доверие", "Понятный профиль помогает клиентам и партнёрам быстрее оценить ваш опыт."], ["Делитесь одной ссылкой", "Используйте ProofPage в соцсетях, письмах, резюме и презентациях."]],
    how: "Как это работает", steps: [["Создайте профиль", "Добавьте имя, фотографию и короткое описание."], ["Добавьте первый проект", "Укажите ссылку, описание и ручные показатели."], ["Опубликуйте страницу", "Делитесь одним запоминающимся адресом."]],
    strip: "Одна ссылка. Все проекты. Больше доверия.", stripItems: [["1 публичная страница", "Главное место для вашей работы"], ["1 проект бесплатно", "Начните без банковской карты"], ["Ручные показатели", "Источник всегда обозначен"]],
    pricing: "Тарифы", pricingTitle: "Начните бесплатно. Растите вместе с будущим Pro.", freeDesc: "Всё необходимое для первого публичного проекта.",
    freeItems: ["Один публичный профиль", "Один проект", "Базовая тема", "Ручные показатели без подтверждения"], proDesc: "Больше пространства и возможностей для растущих основателей.",
    proItems: ["Несколько проектов", "Дополнительные темы", "Расширенная аналитика", "Персональный домен"], soon: "Скоро", start: "Начать бесплатно",
    final: "Покажите свою работу лучше обычного списка ссылок.", footer: ["Продукт", "Документы", "Конфиденциальность", "Контакты"],
  },
} as const;

function Trend({ variant = 0 }: { variant?: number }) {
  const points = variant ? "0,62 13,70 26,43 40,51 53,25 66,38 79,15 90,31 100,19" : "0,78 12,65 24,69 38,31 50,43 62,28 74,38 87,10 100,18";
  return <svg className="trend" viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`fill-${variant}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b6fe8" stopOpacity=".34"/><stop offset="1" stopColor="#8b6fe8" stopOpacity="0"/></linearGradient></defs><path d={`M ${points.replaceAll(" ", " L ")} L 100,90 L 0,90 Z`} fill={`url(#fill-${variant})`}/><polyline points={points} fill="none" stroke="#9b83ef" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale | null>(null);
  useEffect(() => { const saved = localStorage.getItem("proofpage-locale"); if (saved === "en" || saved === "ru") queueMicrotask(() => setLocale(saved)); }, []);
  const choose = (next: Locale) => { localStorage.setItem("proofpage-locale", next); document.documentElement.lang = next; setLocale(next); };
  if (!locale) return <main className="language-screen"><section className="language-card"><div className="brand">Proof<span>Page</span></div><p>Choose your language · Выберите язык</p><div className="language-options"><button onClick={() => choose("en")}>English</button><button onClick={() => choose("ru")}>Русский</button></div></section></main>;
  const t = copy[locale];
  return <main className="dark-site">
    <nav className="nav shell"><a className="brand" href="#top">Proof<span>Page</span></a><div className="nav-links"><a href="#how">{t.nav[0]}</a><a href="#example">{t.nav[1]}</a><a href="#pricing">{t.nav[2]}</a></div><div className="nav-actions"><div className="locale-switch"><button className={locale === "ru" ? "active" : ""} onClick={() => choose("ru")}>RU</button><button className={locale === "en" ? "active" : ""} onClick={() => choose("en")}>EN</button></div><Link href="/login">{t.login}</Link><Link className="nav-cta" href="/signup">{t.create}</Link></div></nav>
    <section id="top" className="hero shell"><div id="example" className="profile-preview"><div className="profile-person"><div className="avatar">IP</div><div><strong>{t.founder}</strong><p>{t.role}</p></div><span className="demo-pill">{t.demo}</span></div><div className="project-grid">{t.projects.map((project, i) => <article className="project-card" key={project.name}><div className="project-head"><div className={`project-logo logo-${i + 1}`}>{project.name[0]}</div><div><h3>{project.name}</h3><p>{project.desc}</p></div></div><div className="metric-row"><strong>{project.value}</strong><span>{project.change}</span></div><Trend variant={i}/><div className="source-pill">● {t.demo}</div></article>)}</div></div><div className="hero-copy"><p className="eyebrow">{t.kicker}</p><h1>{t.title}</h1><p className="hero-intro">{t.intro}</p><div className="button-row"><Link className="button primary" href="/signup">{t.create}</Link><a className="button secondary" href="/demo-founder">{t.example}</a></div><div className="address"><span>proofpage.me/</span><strong>{t.address}</strong><Link href="/signup">{t.claim}</Link></div></div></section>
    <section id="how" className="section shell"><p className="eyebrow">{t.why}</p><h2>{t.whyTitle}</h2><div className="feature-grid">{t.benefits.map((x,i)=><article key={x[0]}><span>0{i+1}</span><div className={`feature-icon fi-${i+1}`}/><h3>{x[0]}</h3><p>{x[1]}</p></article>)}</div><div className="steps"><p className="eyebrow">{t.how}</p>{t.steps.map((x,i)=><article key={x[0]}><b>0{i+1}</b><div><h3>{x[0]}</h3><p>{x[1]}</p></div></article>)}</div></section>
    <section className="proof-strip"><div className="shell"><h2>{t.strip}</h2><div>{t.stripItems.map(x=><article key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></article>)}</div></div></section>
    <section id="pricing" className="section pricing shell"><p className="eyebrow">{t.pricing}</p><h2>{t.pricingTitle}</h2><div className="pricing-grid"><article><h3>Free</h3><div className="price">0</div><p>{t.freeDesc}</p><ul>{t.freeItems.map(x=><li key={x}>✓ {x}</li>)}</ul><Link className="button secondary" href="/signup">{t.start}</Link></article><article className="pro"><span className="soon">{t.soon}</span><h3>Pro</h3><div className="price">—</div><p>{t.proDesc}</p><ul>{t.proItems.map(x=><li key={x}>✓ {x}</li>)}</ul><button className="button disabled" disabled>{t.soon}</button></article></div></section>
    <section className="final-cta shell"><h2>{t.final}</h2><Link className="button primary" href="/signup">{t.start}</Link></section>
    <footer className="shell"><div><div className="brand">Proof<span>Page</span></div><p>© 2026 ProofPage</p></div><div>{t.footer.map(x=><a href="#" key={x}>{x}</a>)}</div></footer>
  </main>;
}
