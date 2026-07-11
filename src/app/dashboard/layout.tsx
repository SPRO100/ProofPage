import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./dashboard.module.css";

const navigation = [
  ["Overview", "/dashboard", "⌂"],
  ["Profile", "/dashboard/profile", "○"],
  ["Projects", "/dashboard/projects", "□"],
  ["Revenue", "/dashboard/revenue", "↗"],
  ["Billing", "/dashboard/billing", "◇"],
] as const;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.wordmark} href="/">ProofPage<span>.</span></Link>
        <nav className={styles.nav}>
          {navigation.map(([label, href, icon]) => <Link href={href} key={href}><span>{icon}</span>{label}</Link>)}
        </nav>
        <div className={styles.planCard}><span>Free plan</span><strong>1 of 1 projects used</strong><Link href="/dashboard/billing">Upgrade to Pro →</Link></div>
        <div className={styles.user}><div>AM</div><p><strong>Alex Morgan</strong><span>alex@example.com</span></p><button>•••</button></div>
      </aside>
      <div className={styles.main}>
        <header className={styles.mobileHeader}><Link className={styles.wordmark} href="/">ProofPage<span>.</span></Link><button>Menu</button></header>
        {children}
      </div>
    </div>
  );
}
