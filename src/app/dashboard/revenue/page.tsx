import styles from '../dashboard.module.css'

export default function RevenuePage() {
  return (
    <main className={styles.content}>
      <div className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Revenue proof</p>
          <h1>Make your numbers credible.</h1>
          <p>Connect a supported source in read-only mode.</p>
        </div>
      </div>

      <section className={styles.revenueHero}>
        <div className={styles.providerLogo}>⏳</div>
        <div>
          <span className={styles.proBadge}>COMING SOON</span>
          <h2>Revenue verification — coming soon</h2>
          <p>
            Verified revenue connections (Stripe, ЮKassa, NOWPayments) are temporarily disabled
            while we complete a security audit. Until then, you can enter revenue figures manually —
            they will always show as <strong>Unverified</strong> on your public profile.
          </p>
          <ul>
            <li>✓ Manual revenue is always shown as Unverified / Не подтверждено</li>
            <li>✓ Verified connections will be available after the security audit</li>
            <li>✓ Your credentials will never be stored until verification is complete</li>
          </ul>
        </div>
        <button className={styles.disabledButton} disabled aria-disabled="true">
          Connect — coming soon
        </button>
      </section>

      <section className={styles.securityNote}>
        <strong>Your credentials stay private.</strong>
        <p>
          When revenue verification launches, provider credentials will be encrypted
          and never exposed in your public profile or browser.
        </p>
      </section>
    </main>
  )
}
