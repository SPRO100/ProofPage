'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthShell, fieldClass, primaryButtonClass } from '@/components/auth/auth-shell'
import { signIn } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'
import { useLocale } from '@/lib/i18n/use-locale'

const initialState: AuthState = {}

// useSearchParams must live inside a Suspense boundary
function LoginForm() {
  const { locale } = useLocale()
  const t = loginCopy[locale]
  const [state, action, pending] = useActionState(signIn, initialState)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  return (
    <>
      <h2>{t.formTitle}</h2>
      <p>{t.formText}</p>

      {state.error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form action={action} className="mt-8 grid gap-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="grid gap-1">
          <label className="text-sm font-bold">
            {t.email}
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
            {t.password}
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
          {pending ? t.pending : t.submit}
        </button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow={{ en: 'Welcome back', ru: 'С возвращением' }}
      title={{ en: 'Your proof is still here.', ru: 'Ваши доказательства на месте.' }}
      description={{ en: 'Sign in to update projects, revenue, and your public proof profile.', ru: 'Войдите, чтобы обновить проекты, выручку и публичный proof‑профиль.' }}
      footer={{
        en: <>New to ProofPage? <Link href="/signup">Create an account</Link></>,
        ru: <>Впервые в ProofPage? <Link href="/signup">Создать аккаунт</Link></>,
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}

const loginCopy = {
  en: { formTitle: 'Log in', formText: 'Use the email connected to your ProofPage.', email: 'Email', password: 'Password', pending: 'Signing in…', submit: 'Log in' },
  ru: { formTitle: 'Вход', formText: 'Используйте почту, привязанную к ProofPage.', email: 'Email', password: 'Пароль', pending: 'Входим…', submit: 'Войти' },
} as const
