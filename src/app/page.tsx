"use client";

import { useEffect, useState } from "react";

type Locale = "en" | "ru";

const translations = {
  en: {
    nav: ["How it works", "Pricing"],
    login: "Log in",
    eyebrow: "Your work. Your numbers. Your proof.",
    title: "Everything you build. One page that proves it.",
    intro:
      "Turn your founder story, products, and real results into a public page people can trust.",
    cta: "Create your free page",
    secondary: "See an example",
    proofLabel: "Revenue verified",
    lastSync: "Synced today",
    profileName: "Alex Morgan",
    profileRole: "Independent founder building useful software.",
    total: "$18.4k/month",
    projects: [
      ["SignalDesk", "Customer feedback without the noise", "$11.2k/mo"],
      ["TinyMetrics", "Simple analytics for small teams", "$7.2k/mo"],
    ],
    valueTitle: "A profile that earns trust before the first conversation.",
    values: [
      ["Show the whole journey", "Active, paused, sold, and closed projects belong to the same founder story."],
      ["Prove real revenue", "Connect a supported payment source in read-only mode and show when the numbers were last synced."],
      ["Own one memorable link", "Share one clean page instead of a folder of links, screenshots, and explanations."],
    ],
    pricingEyebrow: "Simple pricing",
    pricingTitle: "Start with one project. Upgrade when you grow.",
    free: "Free",
    freePrice: "$0",
    freeDescription: "For your first public project.",
    freeFeatures: ["One public profile", "One project", "Base theme", "Manual revenue marked unverified"],
    pro: "Pro",
    popular: "For growing founders",
    proPrice: "$9",
    period: "/ month",
    proDescription: "For a portfolio with proof.",
    proFeatures: ["Multiple projects", "Verified revenue connections", "Revenue charts and sync status", "More themes and advanced analytics"],
    startFree: "Start free",
    choosePro: "Choose Pro",
    trustTitle: "Verified means verifiable.",
    trustText:
      "Manual numbers are always labelled unverified. Connected revenue shows its provider, covered period, and last successful sync.",
    finalTitle: "Your next project deserves more than another link in bio.",
    finalCta: "Claim your ProofPage",
  },
  ru: {
    nav: ["Как это работает", "Тарифы"],
    login: "Войти",
    eyebrow: "Ваши проекты. Ваши цифры. Ваши доказательства.",
    title: "Все ваши проекты. Одна страница, которая говорит за вас.",
    intro:
      "Соберите историю основателя, продукты и реальные результаты в публичном профиле, которому доверяют.",
    cta: "Создать страницу бесплатно",
    secondary: "Посмотреть пример",
    proofLabel: "Выручка подтверждена",
    lastSync: "Обновлено сегодня",
    profileName: "Алекс Морган",
    profileRole: "Независимый основатель полезных цифровых продуктов.",
    total: "$18,4 тыс./мес",
    projects: [
      ["SignalDesk", "Обратная связь от клиентов без лишнего шума", "$11,2 тыс./мес"],
      ["TinyMetrics", "Простая аналитика для небольших команд", "$7,2 тыс./мес"],
    ],
    valueTitle: "Профиль, который вызывает доверие ещё до первого разговора.",
    values: [
      ["Покажите весь путь", "Активные, приостановленные, проданные и закрытые проекты складываются в одну историю."],
      ["Подтвердите реальную выручку", "Подключите платёжный источник в режиме только для чтения и покажите дату обновления цифр."],
      ["Одна запоминающаяся ссылка", "Вместо папки ссылок, скриншотов и объяснений — один понятный публичный профиль."],
    ],
    pricingEyebrow: "Простые тарифы",
    pricingTitle: "Начните с одного проекта. Подключите Pro, когда вырастете.",
    free: "Бесплатно",
    freePrice: "0 ₽",
    freeDescription: "Для первого публичного проекта.",
    freeFeatures: ["Один публичный профиль", "Один проект", "Базовая тема", "Ручная выручка с отметкой «не подтверждена»"],
    pro: "Pro",
    popular: "Для растущих основателей",
    proPrice: "990 ₽",
    period: "/ месяц",
    proDescription: "Для портфолио с подтверждёнными результатами.",
    proFeatures: ["Несколько проектов", "Подтверждение выручки", "Графики и статус синхронизации", "Дополнительные темы и расширенная аналитика"],
    startFree: "Начать бесплатно",
    choosePro: "Выбрать Pro",
    trustTitle: "Подтверждено — значит, можно проверить.",
    trustText:
      "Ручные цифры всегда отмечаются как неподтверждённые. Для подключённой выручки видны источник, период и дата последней синхронизации.",
    finalTitle: "Ваш следующий проект заслуживает большего, чем ещё одна ссылка в профиле.",
    finalCta: "Создать свой ProofPage",
  },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("proofpage-locale");
    if (saved === "en" || saved === "ru") queueMicrotask(() => setLocale(saved));
  }, []);

  const chooseLocale = (next: Locale) => {
    localStorage.setItem("proofpage-locale", next);
    document.documentElement.lang = next;
    setLocale(next);
  };

  if (!locale) {
    return (
      <main className="language-screen">
        <section className="language-card">
          <p className="wordmark">ProofPage</p>
          <h1>Choose your language</h1>
          <p className="muted">Выберите язык</p>
          <div className="language-options">
            <button onClick={() => chooseLocale("en")}>English</button>
            <span />
            <button onClick={() => chooseLocale("ru")}>Русский</button>
          </div>
        </section>
      </main>
    );
  }

  const t = translations[locale];

  return (
    <main>
      <nav className="nav shell">
        <a className="wordmark" href="#top">ProofPage<span>.</span></a>
        <div className="nav-links">
          <a href="#how">{t.nav[0]}</a>
          <a href="#pricing">{t.nav[1]}</a>
        </div>
        <div className="nav-actions">
          <div className="locale-switch">
            <button className={locale === "en" ? "active" : ""} onClick={() => chooseLocale("en")}>EN</button>
            <button className={locale === "ru" ? "active" : ""} onClick={() => chooseLocale("ru")}>RU</button>
          </div>
          <button className="text-button">{t.login}</button>
        </div>
      </nav>

      <section id="top" className="hero shell">
        <div className="hero-copy-wrap">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="hero-intro">{t.intro}</p>
          <div className="button-row">
            <button className="button button-dark">{t.cta}</button>
            <a className="button button-light" href="#example">{t.secondary}</a>
          </div>
        </div>

        <div id="example" className="profile-preview">
          <div className="founder-card">
            <div className="avatar">AM</div>
            <div>
              <h2>{t.profileName}</h2>
              <p>{t.profileRole}</p>
            </div>
            <div className="total-revenue">
              <span>{t.proofLabel}</span>
              <strong>{t.total}</strong>
            </div>
          </div>
          <div className="project-grid">
            {t.projects.map((project, index) => (
              <article className="project-card" key={project[0]}>
                <div className="project-head">
                  <div className={`project-logo logo-${index + 1}`}>{project[0][0]}</div>
                  <div><h3>{project[0]}</h3><p>{project[1]}</p></div>
                  <span className="revenue">{project[2]}</span>
                </div>
                <div className={`chart chart-${index + 1}`} aria-hidden="true"><span /></div>
                <div className="verified"><span>✓</span> {t.proofLabel} · {t.lastSync}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="section shell">
        <h2 className="section-title">{t.valueTitle}</h2>
        <div className="value-grid">
          {t.values.map((value, index) => (
            <article className="value-card" key={value[0]}>
              <span>0{index + 1}</span><h3>{value[0]}</h3><p>{value[1]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <div className="shell trust-inner">
          <div className="trust-mark">✓</div>
          <h2>{t.trustTitle}</h2>
          <p>{t.trustText}</p>
        </div>
      </section>

      <section id="pricing" className="section shell pricing-section">
        <p className="eyebrow">{t.pricingEyebrow}</p>
        <h2 className="section-title">{t.pricingTitle}</h2>
        <div className="pricing-grid">
          <article className="price-card">
            <h3>{t.free}</h3><div className="price">{t.freePrice}</div><p>{t.freeDescription}</p>
            <ul>{t.freeFeatures.map((item) => <li key={item}>✓ {item}</li>)}</ul>
            <button className="button button-light">{t.startFree}</button>
          </article>
          <article className="price-card pro-card">
            <div className="popular">{t.popular}</div>
            <h3>{t.pro}</h3><div className="price">{t.proPrice}<small>{t.period}</small></div><p>{t.proDescription}</p>
            <ul>{t.proFeatures.map((item) => <li key={item}>✓ {item}</li>)}</ul>
            <button className="button button-gold">{t.choosePro}</button>
          </article>
        </div>
      </section>

      <section className="final-cta shell">
        <h2>{t.finalTitle}</h2><button className="button button-gold">{t.finalCta}</button>
      </section>

      <footer className="shell"><span className="wordmark">ProofPage<span>.</span></span><p>© 2026 ProofPage</p></footer>
    </main>
  );
}
