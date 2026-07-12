import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { buildRevenueDisplay } from "@/lib/revenue/verification";
import { isRevenueVerificationEnabled } from "@/lib/flags";
import { MetricChart } from "@/components/metrics/metric-chart";
import type { ProfileLink, ProjectMetric, ProjectStatus, RevenueMetric, RevenueSource } from "@/types/database";
import styles from "../demo-founder/profile.module.css";

type PageProps = { params: Promise<{ username: string }> };

const statusLabels = {
  active: "Active",
  paused: "Paused",
  building: "Building",
  sold: "Sold",
  closed: "Closed",
} as const;

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("display_name, bio_en").eq("username", username).eq("is_public", true).maybeSingle();
  if (!data) return { title: "Profile not found · ProofPage" };
  return { title: `${data.display_name ?? username} · ProofPage`, description: data.bio_en ?? `Projects by ${data.display_name ?? username}` };
}

export default async function PublicFounderPage({ params }: PageProps) {
  const { username } = await params;
  const locale = (await cookies()).get("proofpage-locale")?.value === "ru" ? "ru" : "en";
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).eq("is_public", true).maybeSingle();
  if (!profile) notFound();

  const { data: projects } = await supabase.from("projects").select("*").eq("profile_id", profile.id).eq("is_public", true).order("sort_order");
  const projectList = projects ?? [];
  const projectIds = projectList.map((project) => project.id);
  const { data: metrics } = isRevenueVerificationEnabled() && projectIds.length ? await supabase.from("revenue_metrics").select("*").in("project_id", projectIds).order("recorded_at", { ascending: false }) : { data: [] };
  const { data: manualMetricRows } = projectIds.length ? await supabase.from("project_metrics").select("*").in("project_id", projectIds).order("measured_at", { ascending: true }) : { data: [] };
  const manualByProject = new Map<string, ProjectMetric[]>();
  for (const metric of (manualMetricRows ?? []) as ProjectMetric[]) manualByProject.set(metric.project_id, [...(manualByProject.get(metric.project_id) ?? []), metric]);
  const latestByProject = new Map<string, RevenueMetric>();
  for (const metric of (metrics ?? []) as RevenueMetric[]) if (!latestByProject.has(metric.project_id)) latestByProject.set(metric.project_id, metric);
  const sourceIds = [...latestByProject.values()].map((metric) => metric.source_id).filter((id): id is string => Boolean(id));
  const { data: sources } = sourceIds.length ? await supabase.from("revenue_sources").select("*").in("id", sourceIds) : { data: [] };
  const sourceById = new Map((sources ?? []).map((source) => [source.id, source as RevenueSource]));

  const displayProjects = projectList.map((project) => {
    const metric = latestByProject.get(project.id) ?? null;
    const source = metric?.source_id ? sourceById.get(metric.source_id) ?? null : null;
    return { ...project, revenue: buildRevenueDisplay(metric, source), manualMetrics: (manualByProject.get(project.id) ?? []).filter((point) => point.metric_type === (project.primary_metric_type ?? 'users')) };
  });

  const verifiedTotal = displayProjects.reduce((sum, project) => project.revenue?.state === "verified" ? sum + project.revenue.mrr : sum, 0);
  const verifiedCount = displayProjects.filter((project) => project.revenue?.state === "verified").length;
  const initials = (profile.display_name ?? profile.username).split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const links = Array.isArray(profile.links) ? (profile.links as ProfileLink[]) : [];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}><Link href="/" className={styles.wordmark}>ProofPage<span>.</span></Link><div className={styles.topActions}><span className={styles.language}>EN</span><button className={styles.share}>Share profile</button></div></header>
      <div className={styles.layout}>
        <aside className={styles.founder}>
          {profile.avatar_url ? <div className={styles.avatar} style={{ backgroundImage: `url(${profile.avatar_url})`, backgroundSize: "cover" }} aria-label={profile.display_name ?? profile.username} /> : <div className={styles.avatar}>{initials}</div>}
          <p className={styles.kicker}>Founder profile</p><h1>{profile.display_name ?? profile.username}</h1>
          {profile.location && <p className={styles.location}>{profile.location}</p>}
          {profile.bio_en && <p className={styles.bio}>{profile.bio_en}</p>}
          <div className={styles.totalCard}><div className={styles.verifiedTitle}><span>{verifiedCount ? "✓" : "–"}</span>{verifiedCount ? "Total verified revenue" : "No verified revenue yet"}</div><strong>{formatMoney(verifiedTotal, "USD")}<span>/month</span></strong><p>Across {verifiedCount} connected {verifiedCount === 1 ? "project" : "projects"}</p></div>
          {links.length > 0 && <nav className={styles.socials}>{links.map((link) => <a href={link.url} key={`${link.label}-${link.url}`} rel="noreferrer" target="_blank">{link.label} ↗</a>)}</nav>}
          <div className={styles.availability}><span /> Public ProofPage profile</div>
        </aside>

        <section className={styles.projects}>
          <div className={styles.sectionHead}><div><p>Portfolio</p><h2>What I&apos;m building</h2></div><span>{displayProjects.length} {displayProjects.length === 1 ? "project" : "projects"}</span></div>
          <div className={styles.projectList}>
            {displayProjects.length === 0 && <article className={styles.projectCard}><div className={styles.projectIdentity}><h3>No public projects yet</h3><p>This founder is still preparing their portfolio.</p></div></article>}
            {displayProjects.map((project, index) => {
              const verified = project.revenue?.state === "verified";
              const latestManual = project.manualMetrics.at(-1);
              const manualLabel = latestManual ? metricLabel(latestManual, locale) : null;
              return <article className={styles.projectCard} key={project.id}>
                <div className={styles.cardTop}>{project.logo_url ? <Image className={styles.projectMark} src={project.logo_url} alt="" width={48} height={48} unoptimized/> : <div className={`${styles.projectMark} ${styles[`mark${(index % 3) + 1}`]}`}>{project.name[0]?.toUpperCase()}</div>}<div className={styles.projectIdentity}><div className={styles.nameRow}><h3>{project.name}</h3><span className={styles.status}>{statusLabels[project.status as ProjectStatus]}</span></div><p>{locale === "ru" ? project.description_ru ?? project.description_en ?? "Описание скоро появится." : project.description_en ?? project.description_ru ?? "Project details coming soon."}</p></div>{project.url && <a className={styles.visit} href={project.url} rel="noreferrer" target="_blank">↗</a>}</div>
                <div className={styles.metricRow}><div><span>{manualLabel ?? "Metric"}</span><strong>{latestManual ? formatMetric(latestManual, locale) : project.revenue ? formatMoney(project.revenue.mrr, project.revenue.currency) + "/mo" : (locale === "ru" ? "Не указано" : "Not shared")}</strong></div><div><span>{locale === "ru" ? "Статус" : "Status"}</span><strong className={verified ? styles.green : styles.grey}>{verified ? "Verified" : (locale === "ru" ? "Не подтверждено" : "Unverified")}</strong></div><div><span>{locale === "ru" ? "Источник" : "Source"}</span><strong>{verified && project.revenue?.provider ? project.revenue.provider : (locale === "ru" ? "Введено владельцем" : "Owner entered")}</strong></div></div>
                {project.manualMetrics.length ? <MetricChart points={project.manualMetrics.map((point: ProjectMetric) => ({ id: point.id, value: point.value, measured_at: point.measured_at }))} locale={locale}/> : <div className={`${styles.chart} ${styles[index % 2 ? "steady" : "up"]}`} aria-hidden="true"><span /></div>}
                <footer className={styles.cardFooter}><div className={verified ? styles.verifiedBadge : styles.unverifiedBadge}><span>{verified ? "✓" : "–"}</span>{verified ? "Revenue verified" : (locale === "ru" ? "Введено владельцем · Не подтверждено" : "Owner entered · Unverified")}</div><time>{latestManual ? formatDate(latestManual.measured_at, locale) : verified && project.revenue?.last_synced_at ? `Synced ${formatDate(project.revenue.last_synced_at, locale)}` : (locale === "ru" ? "Нет данных" : "No data")}</time></footer>
              </article>;
            })}
          </div>
        </section>
      </div>
      <footer className={styles.brandFooter}><span>Built with <strong>ProofPage</strong></span><Link href="/signup">Create your page →</Link></footer>
    </main>
  );
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase(), notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: value >= 10000 ? 1 : 0 }).format(value);
}

function formatDate(value: string, locale: "en" | "ru") {
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(d);
}

function metricLabel(metric: ProjectMetric, locale: "en" | "ru") {
  if (metric.metric_type === "custom") return (locale === "ru" ? metric.label_ru ?? metric.label_en : metric.label_en ?? metric.label_ru) ?? (locale === "ru" ? "Показатель" : "Metric");
  const labels = { users:["Users","Пользователи"], customers:["Customers","Клиенты"], signups:["Signups","Регистрации"], sales:["Sales","Продажи"], revenue:["Revenue","Выручка"], mrr:["MRR","MRR"] } as const;
  return labels[metric.metric_type][locale === "ru" ? 1 : 0];
}

function formatMetric(metric: ProjectMetric, locale: "en" | "ru") {
  const value = Number(metric.value).toLocaleString(locale, { maximumFractionDigits: 2 });
  return `${value}${metric.currency ? ` ${metric.currency}` : metric.unit ? ` ${metric.unit}` : ""}`;
}
