import Link from "next/link";
import { AuthShell, fieldClass, primaryButtonClass } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Free to start"
      title="Build your proof in minutes."
      description="Create one founder profile and publish your first project for free. Upgrade only when your portfolio grows."
      footer={<>Already have an account? <Link className="font-bold text-[#141412] underline" href="/login">Log in</Link></>}
    >
      <h2 className="text-2xl font-black tracking-[-0.04em]">Create your account</h2>
      <p className="mt-2 text-sm text-[#706e67]">No card required. Your first project is free.</p>
      <form className="mt-8 grid gap-5">
        <label className="text-sm font-bold">Email<input className={fieldClass} type="email" name="email" placeholder="you@company.com" autoComplete="email" /></label>
        <label className="text-sm font-bold">Password<input className={fieldClass} type="password" name="password" placeholder="At least 8 characters" autoComplete="new-password" /></label>
        <label className="flex items-start gap-3 text-sm leading-6 text-[#706e67]"><input className="mt-1" type="checkbox" />I agree to the Terms and Privacy Policy.</label>
        <button className={primaryButtonClass} type="submit">Create free account</button>
      </form>
    </AuthShell>
  );
}
