import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
};

export function AuthShell({ children, eyebrow, title, description, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f3f1eb] px-5 py-6 text-[#141412]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-[-0.05em]">
          ProofPage<span className="text-[#dda91f]">.</span>
        </Link>
        <span className="text-xs font-bold text-[#706e67]">EN · RU</span>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-6xl place-items-center py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/10 bg-[#fffefa] shadow-[0_30px_90px_rgba(30,26,18,0.09)] md:grid-cols-[0.9fr_1.1fr]">
          <aside className="flex min-h-64 flex-col justify-between bg-[#171714] p-8 text-white md:p-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#dda91f]">{eyebrow}</p>
              <h1 className="mt-6 max-w-md text-4xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">{title}</h1>
              <p className="mt-6 max-w-sm leading-7 text-white/60">{description}</p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-sm text-white/55">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dda91f] font-black text-[#171714]">✓</span>
              Revenue is never marked verified without a connected source.
            </div>
          </aside>
          <div className="p-7 md:p-12">
            {children}
            <div className="mt-8 border-t border-black/10 pt-6 text-center text-sm text-[#706e67]">{footer}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none transition focus:border-[#141412] focus:ring-2 focus:ring-[#dda91f]/25";

export const primaryButtonClass =
  "mt-2 h-12 w-full rounded-full bg-[#171714] px-5 font-bold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#dda91f] focus:ring-offset-2";
