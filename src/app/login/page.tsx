import Link from "next/link";
import { AuthShell, fieldClass, primaryButtonClass } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Your work is still here."
      description="Sign in to update your projects, revenue, and public founder profile."
      footer={<>New to ProofPage? <Link className="font-bold text-[#141412] underline" href="/signup">Create an account</Link></>}
    >
      <h2 className="text-2xl font-black tracking-[-0.04em]">Log in</h2>
      <p className="mt-2 text-sm text-[#706e67]">Use the email connected to your ProofPage.</p>
      <form className="mt-8 grid gap-5">
        <label className="text-sm font-bold">Email<input className={fieldClass} type="email" name="email" placeholder="you@company.com" autoComplete="email" /></label>
        <label className="text-sm font-bold">Password<input className={fieldClass} type="password" name="password" placeholder="••••••••" autoComplete="current-password" /></label>
        <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-[#706e67]"><input type="checkbox" /> Remember me</label><button className="font-bold underline" type="button">Forgot password?</button></div>
        <button className={primaryButtonClass} type="submit">Log in</button>
      </form>
    </AuthShell>
  );
}
