import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.content}>
      <div className={styles.pageHead}><div><p className={styles.eyebrow}>Founder dashboard</p><h1>Good afternoon, Alex.</h1><p>Keep your profile current and your proof credible.</p></div><Link className={styles.primaryButton} href="/demo-founder">View public page ↗</Link></div>
      <section className={styles.metrics}>
        <article><span>Profile views</span><strong>1,248</strong><small>+18% this month</small></article>
        <article><span>Project clicks</span><strong>316</strong><small>25.3% click rate</small></article>
        <article><span>Verified revenue</span><strong>$11.2k</strong><small>Synced today</small></article>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHead}><div><p className={styles.eyebrow}>Profile health</p><h2>Finish the details that build trust.</h2></div><strong>75%</strong></div>
        <div className={styles.progress}><span /></div>
        <div className={styles.checklist}>
          <div className={styles.done}>✓<p><strong>Public profile published</strong><span>proofpage.io/alexmorgan</span></p></div>
          <div className={styles.done}>✓<p><strong>First project added</strong><span>SignalDesk is visible</span></p></div>
          <div>3<p><strong>Connect a revenue source</strong><span>Replace manual figures with verified proof</span></p><Link href="/dashboard/revenue">Connect →</Link></div>
          <div>4<p><strong>Add your founder story</strong><span>Show the milestones behind the projects</span></p><Link href="/dashboard/profile">Edit →</Link></div>
        </div>
      </section>
      <section className={styles.twoColumns}>
        <article className={styles.panel}><div className={styles.panelHead}><div><p className={styles.eyebrow}>Your project</p><h2>SignalDesk</h2></div><span className={styles.status}>Active</span></div><p className={styles.bodyText}>Customer feedback without the noise.</p><div className={styles.projectStats}><span>Revenue<strong>$11.2k/mo</strong></span><span>Proof<strong className={styles.unverified}>Unverified</strong></span></div><Link className={styles.secondaryButton} href="/dashboard/projects">Manage project</Link></article>
        <article className={`${styles.panel} ${styles.upgradePanel}`}><span className={styles.proBadge}>PRO</span><h2>Your next project is waiting.</h2><p>Add unlimited projects, verified revenue, more themes, and deeper analytics.</p><Link className={styles.goldButton} href="/dashboard/billing">Explore Pro</Link></article>
      </section>
    </main>
  );
}
