'use client'

import { useState, useActionState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { completeOnboarding, checkUsername } from '@/app/actions/onboarding'
import type { OnboardingState } from '@/app/actions/onboarding'

const steps = ['Address', 'Profile', 'Project', 'Publish'] as const

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-[#141412] focus:ring-2 focus:ring-[#dda91f]/25'
const textAreaClass =
  'mt-2 min-h-28 w-full resize-none rounded-xl border border-black/15 bg-white p-4 outline-none transition focus:border-[#141412] focus:ring-2 focus:ring-[#dda91f]/25'
const errorClass = 'mt-1 text-xs text-red-600'

const initialState: OnboardingState = {}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)

  // All collected form data across steps
  const [fields, setFields] = useState({
    username: '',
    display_name: '',
    location: '',
    bio: '',
    project_name: '',
    project_status: 'building',
    project_url: '',
    project_description: '',
  })

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameMsg, setUsernameMsg] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, formAction, submitting] = useActionState(completeOnboarding, initialState)
  const [, startTransition] = useTransition()

  // If server returned field errors, derive the target step without useEffect
  const errorStep =
    state.fieldErrors?.username ? 0
    : state.fieldErrors?.display_name ? 1
    : state.fieldErrors?.project_name ? 2
    : null

  // Jump back to the errored step on the next render (avoids setState-in-effect lint rule)
  if (errorStep !== null && errorStep !== step && !submitting) {
    setStep(errorStep)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))

    if (name === 'username') {
      setUsernameStatus('checking')
      setUsernameMsg('')
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          const result = await checkUsername(value)
          if (result.error) {
            setUsernameStatus('invalid')
            setUsernameMsg(result.error)
          } else if (result.available) {
            setUsernameStatus('available')
            setUsernameMsg('This address is available')
          } else {
            setUsernameStatus('taken')
            setUsernameMsg('This address is already taken')
          }
        })
      }, 400)
    }
  }

  function canProceed(): boolean {
    if (step === 0) return fields.username.length >= 3 && usernameStatus === 'available'
    if (step === 1) return fields.display_name.trim().length > 0
    if (step === 2) return fields.project_name.trim().length > 0
    return true
  }

  const globalError = state.error && !state.fieldErrors

  return (
    <main className="min-h-screen bg-[#f3f1eb] px-5 py-7 text-[#141412]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <span className="text-lg font-black tracking-[-0.05em]">
          ProofPage<span className="text-[#dda91f]">.</span>
        </span>
        <Link href="/" className="text-sm font-bold text-[#706e67]">Save and exit</Link>
      </header>

      <section className="mx-auto w-full max-w-3xl py-14">
        {/* Step indicator */}
        <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((label, index) => (
            <div className="flex flex-1 items-center gap-2" key={label}>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${
                  index <= step ? 'bg-[#171714] text-white' : 'border border-black/15 text-[#706e67]'
                }`}
              >
                {index + 1}
              </span>
              <span className="hidden text-xs font-bold text-[#706e67] sm:block">{label}</span>
            </div>
          ))}
        </div>

        {globalError && (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        {/* The form wraps all steps so hidden inputs accumulate */}
        <form action={formAction}>
          {/* Hidden: carry all field values through final submit */}
          <input type="hidden" name="username" value={fields.username} />
          <input type="hidden" name="display_name" value={fields.display_name} />
          <input type="hidden" name="location" value={fields.location} />
          <input type="hidden" name="bio" value={fields.bio} />
          <input type="hidden" name="project_name" value={fields.project_name} />
          <input type="hidden" name="project_status" value={fields.project_status} />
          <input type="hidden" name="project_url" value={fields.project_url} />
          <input type="hidden" name="project_description" value={fields.project_description} />

          <div className="mt-12 rounded-[28px] border border-black/10 bg-[#fffefa] p-7 shadow-[0_30px_90px_rgba(30,26,18,0.08)] md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b6a0c]">
              Step {step + 1} of 4
            </p>

            {step === 0 && (
              <StepAddress
                value={fields.username}
                onChange={handleChange}
                status={usernameStatus}
                statusMsg={usernameMsg}
                serverError={state.fieldErrors?.username}
              />
            )}
            {step === 1 && (
              <StepProfile
                displayName={fields.display_name}
                location={fields.location}
                bio={fields.bio}
                onChange={handleChange}
                serverError={state.fieldErrors?.display_name}
              />
            )}
            {step === 2 && (
              <StepProject
                name={fields.project_name}
                status={fields.project_status}
                url={fields.project_url}
                description={fields.project_description}
                onChange={handleChange}
                serverError={state.fieldErrors?.project_name}
              />
            )}
            {step === 3 && <StepPublish />}

            <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
              <button
                type="button"
                className="font-bold text-[#706e67] disabled:opacity-30"
                disabled={step === 0}
                onClick={() => setStep((v) => Math.max(0, v - 1))}
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  className="h-12 rounded-full bg-[#171714] px-7 font-bold text-white disabled:opacity-40"
                  disabled={!canProceed()}
                  onClick={() => setStep((v) => v + 1)}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="h-12 rounded-full bg-[#171714] px-7 font-bold text-white disabled:opacity-40"
                  disabled={submitting}
                >
                  {submitting ? 'Publishing…' : 'Publish ProofPage'}
                </button>
              )}
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

type ChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void

function Heading({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h1 className="mt-4 text-4xl font-black tracking-[-0.055em]">{title}</h1>
      <p className="mt-3 max-w-xl leading-7 text-[#706e67]">{text}</p>
    </>
  )
}

function StepAddress({
  value,
  onChange,
  status,
  statusMsg,
  serverError,
}: {
  value: string
  onChange: ChangeHandler
  status: string
  statusMsg: string
  serverError?: string
}) {
  const error = serverError ?? (status === 'taken' || status === 'invalid' ? statusMsg : '')
  const isAvailable = status === 'available'

  return (
    <div>
      <Heading
        title="Claim your address"
        text="Choose the short link you will share with customers, partners, and other founders."
      />
      <label className="mt-8 block text-sm font-bold">
        Public address
        <div
          className={`mt-2 flex h-12 overflow-hidden rounded-xl border bg-white transition focus-within:border-[#141412] ${
            error ? 'border-red-400' : isAvailable ? 'border-[#18794e]' : 'border-black/15'
          }`}
        >
          <span className="flex items-center border-r border-black/10 bg-[#f3f1eb] px-4 text-sm text-[#706e67]">
            proofpage.io/
          </span>
          <input
            className="min-w-0 flex-1 px-3 outline-none"
            name="username"
            placeholder="yourname"
            value={value}
            onChange={onChange}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </label>
      {error ? (
        <p className={errorClass}>{error}</p>
      ) : isAvailable ? (
        <p className="mt-1 text-xs text-[#18794e]">{statusMsg}</p>
      ) : status === 'checking' ? (
        <p className="mt-1 text-xs text-[#706e67]">Checking…</p>
      ) : (
        <p className="mt-1 text-xs text-[#706e67]">3–30 characters. Lowercase letters, numbers, and hyphens.</p>
      )}
    </div>
  )
}

function StepProfile({
  displayName,
  location,
  bio,
  onChange,
  serverError,
}: {
  displayName: string
  location: string
  bio: string
  onChange: ChangeHandler
  serverError?: string
}) {
  return (
    <div>
      <Heading
        title="Introduce yourself"
        text="Keep it short. Visitors should understand who you are and what you build in a few seconds."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-bold">
            Display name
            <input
              className={`${inputClass} ${serverError ? 'border-red-400' : ''}`}
              name="display_name"
              placeholder="Alex Morgan"
              value={displayName}
              onChange={onChange}
            />
          </label>
          {serverError && <p className={errorClass}>{serverError}</p>}
        </div>
        <label className="text-sm font-bold">
          Location
          <input
            className={inputClass}
            name="location"
            placeholder="Tallinn, Estonia"
            value={location}
            onChange={onChange}
          />
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Short bio
          <textarea
            className={textAreaClass}
            name="bio"
            placeholder="Independent founder building useful software."
            value={bio}
            onChange={onChange}
          />
        </label>
      </div>
    </div>
  )
}

function StepProject({
  name,
  status,
  url,
  description,
  onChange,
  serverError,
}: {
  name: string
  status: string
  url: string
  description: string
  onChange: ChangeHandler
  serverError?: string
}) {
  return (
    <div>
      <Heading
        title="Add your first project"
        text="The Free plan includes one public project. You can add more projects later with Pro."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-bold">
            Project name
            <input
              className={`${inputClass} ${serverError ? 'border-red-400' : ''}`}
              name="project_name"
              placeholder="SignalDesk"
              value={name}
              onChange={onChange}
            />
          </label>
          {serverError && <p className={errorClass}>{serverError}</p>}
        </div>
        <label className="text-sm font-bold">
          Status
          <select
            className={inputClass}
            name="project_status"
            value={status}
            onChange={onChange}
          >
            <option value="active">Active</option>
            <option value="building">Building</option>
            <option value="paused">Paused</option>
            <option value="sold">Sold</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Website
          <input
            className={inputClass}
            type="url"
            name="project_url"
            placeholder="https://example.com"
            value={url}
            onChange={onChange}
          />
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Description
          <textarea
            className={textAreaClass}
            name="project_description"
            placeholder="What does your project help people do?"
            value={description}
            onChange={onChange}
          />
        </label>
      </div>
    </div>
  )
}

function StepPublish() {
  return (
    <div>
      <Heading
        title="Ready to go public"
        text="Review your information and publish your first ProofPage. You can edit everything later."
      />
      <div className="mt-8 rounded-2xl border border-[#18794e]/20 bg-[#eaf7ef] p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#18794e] font-black text-white">✓</span>
          <div>
            <strong>Your free page is ready</strong>
            <p className="mt-1 text-sm text-[#47705a]">One profile · One project · Base theme</p>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-black/10 p-5 text-sm text-[#706e67]">
        <strong className="text-[#141412]">A note about revenue</strong>
        <p className="mt-2 leading-6">
          Any revenue entered manually will be displayed as Unverified. Verified Revenue is
          available with Pro after connecting a supported source.
        </p>
      </div>
    </div>
  )
}
