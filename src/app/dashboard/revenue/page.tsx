import styles from "../dashboard.module.css";

export default function RevenuePage() {
  return <main className={styles.content}><div className={styles.pageHead}><div><p className={styles.eyebrow}>Revenue proof</p><h1>Make your numbers credible.</h1><p>Connect a supported source in read-only mode.</p></div></div><section className={styles.revenueHero}><div className={styles.providerLogo}>S</div><div><span className={styles.proBadge}>PRO FEATURE</span><h2>Connect Stripe</h2><p>ProofPage reads aggregated revenue metrics. It cannot create charges, issue refunds, or move money.</p><ul><li>✓ Read-only connection</li><li>✓ Provider and sync time shown publicly</li><li>✓ Disconnect whenever you want</li></ul></div><button className={styles.goldButton}>Upgrade and connect</button></section><section className={styles.securityNote}><strong>Your credentials stay private.</strong><p>Provider credentials are encrypted and never exposed in your public profile or browser.</p></section></main>;
}
