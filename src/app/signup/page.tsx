'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { AuthShell, fieldClass, primaryButtonClass } from '@/components/auth/auth-shell'
import { signUp } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

const initialState: AuthState = {}

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, initialState)

  return (
    <AuthShell
      eyebrow="Free to start"
      title="Build your proof in minutes."
      description="Create one founder profile and publish your first project for free. Upgrade only when your portfolio grows."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-bold text-[#141412] underline" href="/login">
            Log in
          </Link>
        </>
      }
    >
      <h2 className="text-2xl font-black tracking-[-0.04em]">Create your account</h2>
      <p className="mt-2 text-sm text-[#706e67]">No card required. Your first project is free.</p>

      {state.error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form action={action} className="mt-8 grid gap-5">
        <div className="grid gap-1">
          <label className="text-sm font-bold">
            Email
            <input
              className={fieldClass}
              type="email"
              name="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
            />
          </label>
          {state.fieldErrors?.email && (
            <p id="email-error" className="text-xs text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-bold">
            Password
            <input
              className={fieldClass}
              type="password"
              name="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
            />
          </label>
          {state.fieldErrors?.password && (
            <p id="password-error" className="text-xs text-red-600">{state.fieldErrors.password}</p>
          )}
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-[#706e67]">
          <input className="mt-1" type="checkbox" required />
          I agree to the Terms and Privacy Policy.
        </label>

        <button
          className={`${primaryButtonClass} disabled:opacity-60`}
          type="submit"
          disabled={pending}
        >
          {pending ? 'Creating account…' : 'Create free account'}
        </button>
      </form>
    </AuthShell>
  )
}
