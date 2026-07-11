import Link from "next/link";
import styles from "./profile.module.css";

const projects = [
  {
    name: "SignalDesk",
    mark: "S",
    description: "Customer feedback without the noise.",
    status: "Active",
    revenue: "$11.2k/mo",
    verification: "verified",
    provider: "Stripe",
    sync: "Synced today",
    chart: "up",
  },
  {
    name: "TinyMetrics",
    mark: "T",
    description: "Simple, privacy-first analytics for small teams.",
    status: "Active",
    revenue: "$7.2k/mo",
    verification: "verified",
    provider: "Stripe",
    sync: "Synced today",
    chart: "steady",
  },
  {
    name: "DraftKit",
    mark: "D",
    description: "A lightweight writing workspace for product teams.",
    status: "Building",
    revenue: "$800/mo",
    verification: "unverified",
    provider: "Manual entry",
    sync: "Not connected",
    chart: "new",
  },
] as const;

export default function DemoFounderPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.wordmark}>ProofPage<span>.</span></Link>
        <div className={styles.topActions}>
          <button className={styles.language}>EN <span>RU</span></button>
          <button className={styles.share}>Share profile</button>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.founder}>
          <div className={styles.avatar}>AM</div>
          <p className={styles.kicker}>Independent founder</p>
          <h1>Alex Morgan</h1>
          <p className={styles.location}>Tallinn, Estonia</p>
          <p className={styles.bio}>I build focused software for small teams. Less dashboard theatre, more useful work.</p>

          <div className={styles.totalCard}>
            <div className={styles.verifiedTitle}><span>✓</span> Total verified revenue</div>
            <strong>$18.4k<span>/month</span></strong>
            <p>Across 2 connected projects</p>
          </div>

          <nav className={styles.socials} aria-label="Social links">
            <a href="#twitter">X / Twitter ↗</a>
            <a href="#linkedin">LinkedIn ↗</a>
            <a href="#website">Personal site ↗</a>
          </nav>

          <div className={styles.availability}><span /> Open to founder conversations</div>
        </aside>

        <section className={styles.projects}>
          <div className={styles.sectionHead}>
            <div><p>Portfolio</p><h2>What I&apos;m building</h2></div>
            <span>{projects.length} projects</span>
          </div>

          <div className={styles.projectList}>
            {projects.map((project, index) => (
              <article className={styles.projectCard} key={project.name}>
                <div className={styles.cardTop}>
                  <div className={`${styles.projectMark} ${styles[`mark${index + 1}`]}`}>{project.mark}</div>
                  <div className={styles.projectIdentity}>
                    <div className={styles.nameRow}><h3>{project.name}</h3><span className={styles.status}>{project.status}</span></div>
                    <p>{project.description}</p>
                  </div>
                  <a className={styles.visit} href={`#${project.name.toLowerCase()}`} aria-label={`Visit ${project.name}`}>↗</a>
                </div>

                <div className={styles.metricRow}>
                  <div><span>Revenue</span><strong>{project.revenue}</strong></div>
                  <div><span>Proof</span><strong className={project.verification === "verified" ? styles.green : styles.grey}>{project.verification === "verified" ? "Verified" : "Unverified"}</strong></div>
                  <div><span>Source</span><strong>{project.provider}</strong></div>
                </div>

                <div className={`${styles.chart} ${styles[project.chart]}`} aria-hidden="true"><span /></div>

                <footer className={styles.cardFooter}>
                  <div className={project.verification === "verified" ? styles.verifiedBadge : styles.unverifiedBadge}>
                    <span>{project.verification === "verified" ? "✓" : "–"}</span>
                    {project.verification === "verified" ? "Revenue verified" : "Revenue not verified"}
                  </div>
                  <time>{project.sync}</time>
                </footer>
              </article>
            ))}
          </div>

          <div className={styles.journey}>
            <p>Founder note</p>
            <blockquote>“I used to hide the projects that didn&apos;t work. Now I think they explain the successful ones better than anything else.”</blockquote>
            <div className={styles.timeline}>
              <span><strong>2023</strong> First $1 online</span>
              <span><strong>2024</strong> SignalDesk launched</span>
              <span><strong>2025</strong> $10k monthly revenue</span>
              <span><strong>Now</strong> Building DraftKit</span>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.brandFooter}>
        <span>Built with <strong>ProofPage</strong></span>
        <Link href="/signup">Create your page →</Link>
      </footer>
    </main>
  );
}
