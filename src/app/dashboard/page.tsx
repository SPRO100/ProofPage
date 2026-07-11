import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth/helpers'
import { signOut } from '@/app/actions/auth'

// Temporary dashboard shell — Codex will build the full UI in PP-008.
// This page confirms auth works end-to-end.
export default async function DashboardPage() {
  const profile = await requireProfile()

  // If the user somehow skipped onboarding (no display_name set), send them there.
  if (!profile.display_name) redirect('/onboarding')

  return (
    <main className="min-h-screen bg-[#f3f1eb] px-5 py-7 text-[#141412]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <span className="text-lg font-black tracking-[-0.05em]">
          ProofPage<span className="text-[#dda91f]">.</span>
        </span>
        <form action={signOut}>
          <button type="submit" className="text-sm font-bold text-[#706e67] hover:text-[#141412]">
            Sign out
          </button>
        </form>
      </header>

      <section className="mx-auto mt-16 w-full max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b6a0c]">Dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
          Welcome, {profile.display_name}
        </h1>
        <p className="mt-3 text-[#706e67]">
          Your public page:{' '}
          <a
            href={`/${profile.username}`}
            className="font-bold text-[#141412] underline"
          >
            proofpage.io/{profile.username}
          </a>
        </p>
        <p className="mt-8 rounded-2xl border border-black/10 bg-[#fffefa] p-6 text-sm text-[#706e67]">
          Full dashboard UI is coming in PP-008. Auth is wired up and working.
        </p>
      </section>
    </main>
  )
}
