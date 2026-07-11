"use client";

import { useState } from "react";

const steps = ["Address", "Profile", "Project", "Publish"] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <main className="min-h-screen bg-[#f3f1eb] px-5 py-7 text-[#141412]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <span className="text-lg font-black tracking-[-0.05em]">ProofPage<span className="text-[#dda91f]">.</span></span>
        <button className="text-sm font-bold text-[#706e67]">Save and exit</button>
      </header>

      <section className="mx-auto w-full max-w-3xl py-14">
        <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((label, index) => <div className="flex flex-1 items-center gap-2" key={label}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${index <= step ? "bg-[#171714] text-white" : "border border-black/15 text-[#706e67]"}`}>{index + 1}</span><span className="hidden text-xs font-bold text-[#706e67] sm:block">{label}</span></div>)}
        </div>

        <div className="mt-12 rounded-[28px] border border-black/10 bg-[#fffefa] p-7 shadow-[0_30px_90px_rgba(30,26,18,0.08)] md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b6a0c]">Step {step + 1} of 4</p>
          {step === 0 && <StepAddress />}
          {step === 1 && <StepProfile />}
          {step === 2 && <StepProject />}
          {step === 3 && <StepPublish />}
          <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
            <button className="font-bold text-[#706e67] disabled:opacity-30" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
            <button className="h-12 rounded-full bg-[#171714] px-7 font-bold text-white" onClick={() => setStep((value) => Math.min(3, value + 1))}>{step === 3 ? "Publish ProofPage" : "Continue"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputClass = "mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none focus:border-[#141412] focus:ring-2 focus:ring-[#dda91f]/25";
const textAreaClass = "mt-2 min-h-28 w-full resize-none rounded-xl border border-black/15 bg-white p-4 outline-none focus:border-[#141412] focus:ring-2 focus:ring-[#dda91f]/25";

function Heading({ title, text }: { title: string; text: string }) { return <><h1 className="mt-4 text-4xl font-black tracking-[-0.055em]">{title}</h1><p className="mt-3 max-w-xl leading-7 text-[#706e67]">{text}</p></>; }

function StepAddress() { return <div><Heading title="Claim your address" text="Choose the short link you will share with customers, partners, and other founders." /><label className="mt-8 block text-sm font-bold">Public address<div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-black/15 bg-white focus-within:border-[#141412]"><span className="flex items-center border-r border-black/10 bg-[#f3f1eb] px-4 text-sm text-[#706e67]">proofpage.io/</span><input className="min-w-0 flex-1 px-3 outline-none" placeholder="yourname" /></div></label><p className="mt-3 text-xs text-[#706e67]">3–30 characters. Lowercase letters, numbers, and hyphens.</p></div>; }
function StepProfile() { return <div><Heading title="Introduce yourself" text="Keep it short. Visitors should understand who you are and what you build in a few seconds." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Display name<input className={inputClass} placeholder="Alex Morgan" /></label><label className="text-sm font-bold">Location<input className={inputClass} placeholder="Tallinn, Estonia" /></label><label className="text-sm font-bold sm:col-span-2">Short bio<textarea className={textAreaClass} placeholder="Independent founder building useful software." /></label></div></div>; }
function StepProject() { return <div><Heading title="Add your first project" text="The Free plan includes one public project. You can add more projects later with Pro." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Project name<input className={inputClass} placeholder="SignalDesk" /></label><label className="text-sm font-bold">Status<select className={inputClass} defaultValue="active"><option value="active">Active</option><option value="building">Building</option><option value="paused">Paused</option><option value="sold">Sold</option><option value="closed">Closed</option></select></label><label className="text-sm font-bold sm:col-span-2">Website<input className={inputClass} type="url" placeholder="https://example.com" /></label><label className="text-sm font-bold sm:col-span-2">Description<textarea className={textAreaClass} placeholder="What does your project help people do?" /></label></div></div>; }
function StepPublish() { return <div><Heading title="Ready to go public" text="Review your information and publish your first ProofPage. You can edit everything later." /><div className="mt-8 rounded-2xl border border-[#18794e]/20 bg-[#eaf7ef] p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#18794e] font-black text-white">✓</span><div><strong>Your free page is ready</strong><p className="mt-1 text-sm text-[#47705a]">One profile · One project · Base theme</p></div></div></div><div className="mt-5 rounded-2xl border border-black/10 p-5 text-sm text-[#706e67]"><strong className="text-[#141412]">A note about revenue</strong><p className="mt-2 leading-6">Any revenue entered manually will be displayed as Unverified. Verified Revenue is available with Pro after connecting a supported source.</p></div></div>; }
