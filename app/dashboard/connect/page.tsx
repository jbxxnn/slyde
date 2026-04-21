import Link from "next/link";
import { Cable, CheckCircle2, ExternalLink } from "lucide-react";
import { getWorkspaceContext } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const context = await getWorkspaceContext();

  if (!context) {
    return null;
  }

  const { data: accounts } = await context.supabase
    .from("instagram_accounts")
    .select("id, ig_user_id, username, page_id, page_name, status, created_at")
    .eq("workspace_id", context.workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Instagram</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Connect accounts</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink/64">
            Connect Instagram professional accounts through Meta OAuth. Connected accounts can be
            selected in keyword rules.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white"
          href="/api/meta/oauth/start"
        >
          <Cable size={17} aria-hidden />
          Connect Instagram
        </Link>
      </div>

      {params.connected ? (
        <p className="mt-6 rounded-md bg-mist px-4 py-3 text-sm text-moss">
          Instagram account connection saved.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-6 rounded-md bg-clay/10 px-4 py-3 text-sm text-clay">{params.error}</p>
      ) : null}

      <section className="mt-8 grid gap-4">
        {accounts?.length ? (
          accounts.map((account) => (
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" key={account.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-ink">@{account.username ?? account.ig_user_id}</h2>
                  <p className="mt-1 text-sm text-ink/58">{account.page_name ?? account.page_id}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-md bg-mist px-3 py-2 text-sm font-semibold text-moss">
                  <CheckCircle2 size={16} aria-hidden />
                  {account.status}
                </span>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
            <ExternalLink className="text-clay" size={24} aria-hidden />
            <h2 className="mt-5 text-xl font-semibold text-ink">No accounts connected</h2>
            <p className="mt-2 leading-7 text-ink/64">
              Use a Meta developer app in development mode while building. Add yourself as a tester
              before app review.
            </p>
          </article>
        )}
      </section>
    </div>
  );
}
