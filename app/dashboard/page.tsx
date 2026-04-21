import Link from "next/link";
import { ArrowRight, Cable, ListChecks, MessageCircle, ShieldAlert } from "lucide-react";
import { getWorkspaceContext } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const context = await getWorkspaceContext();

  if (!context) {
    return null;
  }

  const [{ count: accountCount }, { count: ruleCount }, { count: runCount }, { data: runs }] =
    await Promise.all([
      context.supabase
        .from("instagram_accounts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", context.workspace.id),
      context.supabase
        .from("automation_rules")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", context.workspace.id),
      context.supabase
        .from("automation_runs")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", context.workspace.id),
      context.supabase
        .from("automation_runs")
        .select("id, status, trigger_type, created_at, error_message")
        .eq("workspace_id", context.workspace.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Instagram accounts", value: accountCount ?? 0, icon: Cable },
    { label: "Active rules", value: ruleCount ?? 0, icon: ListChecks },
    { label: "Automation runs", value: runCount ?? 0, icon: MessageCircle },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Automation overview</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink/64">
            Connect Instagram, create keyword rules, and keep logs visible for debugging and Meta
            review.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white"
          href="/dashboard/rules"
        >
          Create rule
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" key={stat.label}>
            <stat.icon className="text-clay" size={22} aria-hidden />
            <p className="mt-5 text-3xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm font-semibold text-ink/58">{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-amber/30 bg-amber/10 p-5">
        <div className="flex gap-3">
          <ShieldAlert className="mt-1 shrink-0 text-amber" size={22} aria-hidden />
          <div>
            <h2 className="font-semibold text-ink">Meta review milestone</h2>
            <p className="mt-2 leading-7 text-ink/68">
              Keep this dashboard populated with working connection, rule, and log flows before
              submitting app review. Reviewers need a visible reason for each requested permission.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-ink">Recent runs</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-white">
          {runs?.length ? (
            runs.map((run) => (
              <div className="grid gap-2 border-b border-ink/10 p-4 sm:grid-cols-4" key={run.id}>
                <span className="font-semibold text-ink">{run.trigger_type}</span>
                <span className="text-ink/64">{run.status}</span>
                <span className="text-ink/64">{new Date(run.created_at).toLocaleString()}</span>
                <span className="text-clay">{run.error_message}</span>
              </div>
            ))
          ) : (
            <p className="p-5 text-ink/60">No automation runs yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
