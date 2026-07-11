"use client";
import { useEffect, useState } from "react";
type Locale = "en" | "ru";
const content = {
 en:{eyebrow:"Your work. Your numbers. Your proof.",title:"Show what you build.",description:"Create one clear page for your founder story, projects, and verified revenue.",action:"Create your ProofPage"},
 ru:{eyebrow:"Ваши проекты. Ваши цифры. Ваши доказательства.",title:"Покажите, что вы создаёте.",description:"Соберите историю основателя, проекты и подтверждённую выручку на одной странице.",action:"Создать ProofPage"}
};
export default function Home(){
 const [locale,setLocale]=useState<Locale|null>(null);
 useEffect(()=>{const saved=localStorage.getItem("proofpage-locale");if(saved==="en"||saved==="ru")queueMicrotask(()=>setLocale(saved));},[]);
 const choose=(next:Locale)=>{localStorage.setItem("proofpage-locale",next);document.documentElement.lang=next;setLocale(next);};
 if(!locale)return <main className="language-screen"><section className="language-card"><p className="wordmark">ProofPage</p><h1>Choose your language</h1><p className="muted">Выберите язык</p><div className="language-options"><button onClick={()=>choose("en")}>English</button><span/><button onClick={()=>choose("ru")}>Русский</button></div></section></main>;
 const copy=content[locale];
 return <main className="landing-shell"><nav><span className="wordmark">ProofPage</span><div className="locale-switch"><button className={locale==="en"?"active":""} onClick={()=>choose("en")}>EN</button><button className={locale==="ru"?"active":""} onClick={()=>choose("ru")}>RU</button></div></nav><section className="hero"><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p className="hero-copy">{copy.description}</p><button className="primary-action">{copy.action}</button></section></main>;
}
