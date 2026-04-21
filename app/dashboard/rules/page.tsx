import { Pause, Play, Plus } from "lucide-react";
import { getWorkspaceContext } from "@/lib/dashboard";
import { createRule, updateRuleStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const context = await getWorkspaceContext();

  if (!context) {
    return null;
  }

  const [{ data: accounts }, { data: rules }] = await Promise.all([
    context.supabase
      .from("instagram_accounts")
      .select("id, username, ig_user_id")
      .eq("workspace_id", context.workspace.id)
      .order("created_at", { ascending: false }),
    context.supabase
      .from("automation_rules")
      .select("id, trigger_type, keyword, match_type, response_text, status, created_at, instagram_accounts(username)")
      .eq("workspace_id", context.workspace.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Rules</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Keyword automations</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/64">
          Start with simple triggers: incoming DM keyword replies and comment keyword private replies.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
          <Plus size={20} aria-hidden />
          New rule
        </h2>

        <form action={createRule} className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Instagram account
            <select
              className="rounded-md border border-ink/15 bg-paper px-4 py-3 font-normal"
              name="instagram_account_id"
              required
            >
              <option value="">Select account</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  @{account.username ?? account.ig_user_id}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Trigger
            <select
              className="rounded-md border border-ink/15 bg-paper px-4 py-3 font-normal"
              name="trigger_type"
              required
            >
              <option value="dm_keyword">DM contains keyword</option>
              <option value="comment_keyword">Comment contains keyword</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Keyword
            <input
              className="rounded-md border border-ink/15 bg-paper px-4 py-3 font-normal"
              name="keyword"
              placeholder="guide"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Match type
            <select
              className="rounded-md border border-ink/15 bg-paper px-4 py-3 font-normal"
              name="match_type"
            >
              <option value="contains">Contains</option>
              <option value="exact">Exact</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink lg:col-span-2">
            Response
            <textarea
              className="min-h-28 rounded-md border border-ink/15 bg-paper px-4 py-3 font-normal"
              name="response_text"
              placeholder="Here is the guide: https://example.com/guide"
              required
            />
          </label>

          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white lg:w-fit">
            <Plus size={16} aria-hidden />
            Create rule
          </button>
        </form>

        {!accounts?.length ? (
          <p className="mt-4 rounded-md bg-amber/10 px-4 py-3 text-sm text-ink/70">
            Connect an Instagram account before creating rules.
          </p>
        ) : null}
        {params.created ? (
          <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm text-moss">Rule created.</p>
        ) : null}
        {params.error ? (
          <p className="mt-4 rounded-md bg-clay/10 px-4 py-3 text-sm text-clay">
            {params.error}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-ink">Existing rules</h2>
        <div className="mt-4 grid gap-3">
          {rules?.length ? (
            rules.map((rule) => {
              const nextStatus = rule.status === "active" ? "paused" : "active";
              const account = Array.isArray(rule.instagram_accounts)
                ? rule.instagram_accounts[0]
                : rule.instagram_accounts;

              return (
                <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" key={rule.id}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
                        {rule.trigger_type.replace("_", " ")}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-ink">
                        {rule.match_type} "{rule.keyword}"
                      </h3>
                      <p className="mt-2 text-sm text-ink/58">@{account?.username ?? "unknown"}</p>
                    </div>
                    <form action={updateRuleStatus}>
                      <input name="id" type="hidden" value={rule.id} />
                      <input name="status" type="hidden" value={nextStatus} />
                      <button className="inline-flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold">
                        {rule.status === "active" ? (
                          <Pause size={16} aria-hidden />
                        ) : (
                          <Play size={16} aria-hidden />
                        )}
                        {rule.status}
                      </button>
                    </form>
                  </div>
                  <p className="mt-4 rounded-md bg-mist px-4 py-3 leading-7 text-ink/72">
                    {rule.response_text}
                  </p>
                </article>
              );
            })
          ) : (
            <p className="rounded-lg border border-ink/10 bg-white p-5 text-ink/60">No rules yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
