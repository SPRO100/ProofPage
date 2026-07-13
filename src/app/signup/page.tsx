'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { AuthShell, fieldClass, primaryButtonClass } from '@/components/auth/auth-shell'
import { signUp } from '@/app/actions/auth'
import type { AuthState } from '@/app/actions/auth'
import { useLocale } from '@/lib/i18n/use-locale'

const initialState: AuthState = {}

export default function SignupPage() {
  const { locale } = useLocale()
  const t = signupCopy[locale]
  const [state, action, pending] = useActionState(signUp, initialState)

  return (
    <AuthShell
      eyebrow={{ en: 'Free to start', ru: 'Начните бесплатно' }}
      title={{ en: 'Build your proof in minutes.', ru: 'Соберите proof за несколько минут.' }}
      description={{ en: 'Create one founder profile and publish your first project for free. Upgrade only when your portfolio grows.', ru: 'Создайте профиль основателя и опубликуйте первый проект бесплатно. Переходите на Pro, когда портфолио вырастет.' }}
      footer={{
        en: <>Already have an account? <Link href="/login">Log in</Link></>,
        ru: <>Уже есть аккаунт? <Link href="/login">Войти</Link></>,
      }}
    >
      <h2>{t.formTitle}</h2>
      <p>{t.formText}</p>

      {state.error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form action={action} className="mt-8 grid gap-5">
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
              placeholder={t.passwordPlaceholder}
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
          {t.terms}
        </label>

        <button
          className={`${primaryButtonClass} disabled:opacity-60`}
          type="submit"
          disabled={pending}
        >
          {pending ? t.pending : t.submit}
        </button>
      </form>
    </AuthShell>
  )
}

const signupCopy = {
  en: { formTitle: 'Create your account', formText: 'No card required. Your first project is free.', email: 'Email', password: 'Password', passwordPlaceholder: 'At least 8 characters', terms: 'I agree to the Terms and Privacy Policy.', pending: 'Creating account…', submit: 'Create free account' },
  ru: { formTitle: 'Создайте аккаунт', formText: 'Карта не нужна. Первый проект — бесплатно.', email: 'Email', password: 'Пароль', passwordPlaceholder: 'Не менее 8 символов', terms: 'Я принимаю Условия и Политику конфиденциальности.', pending: 'Создаём аккаунт…', submit: 'Создать бесплатный аккаунт' },
} as const
