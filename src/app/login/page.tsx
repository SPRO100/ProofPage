'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthShell, fieldClass, primaryButtonClass } from '@/components/auth/auth-shell'
import { signIn } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'

const initialState: AuthState = {}

// useSearchParams must live inside a Suspense boundary
function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  return (
    <>
      <h2 className="text-2xl font-black tracking-[-0.04em]">Log in</h2>
      <p className="mt-2 text-sm text-[#706e67]">Use the email connected to your ProofPage.</p>

      {state.error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form action={action} className="mt-8 grid gap-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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
              placeholder="••••••••"
              autoComplete="current-password"
              required
              aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
            />
          </label>
          {state.fieldErrors?.password && (
            <p id="password-error" className="text-xs text-red-600">{state.fieldErrors.password}</p>
          )}
        </div>

        <button
          className={`${primaryButtonClass} disabled:opacity-60`}
          type="submit"
          disabled={pending}
        >
          {pending ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Your work is still here."
      description="Sign in to update your projects, revenue, and public founder profile."
      footer={
        <>
          New to ProofPage?{' '}
          <Link className="font-bold text-[#141412] underline" href="/signup">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
