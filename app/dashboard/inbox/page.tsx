import { Inbox } from "lucide-react";
import { getWorkspaceContext } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const context = await getWorkspaceContext();

  if (!context) {
    return null;
  }

  const { data: events } = await context.supabase
    .from("webhook_events")
    .select("id, event_type, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(15);

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Inbox</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Webhook events</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/64">
          This MVP view shows recent Meta webhook payloads. A full human inbox can build on this
          event stream.
        </p>
      </div>

      <section className="mt-8 grid gap-3">
        {events?.length ? (
          events.map((event) => (
            <article className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" key={event.id}>
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <h2 className="font-semibold text-ink">{event.event_type}</h2>
                <time className="text-sm text-ink/55">{new Date(event.created_at).toLocaleString()}</time>
              </div>
              <pre className="mt-4 max-h-52 overflow-auto rounded-md bg-ink p-4 text-xs leading-6 text-white">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </article>
          ))
        ) : (
          <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
            <Inbox className="text-clay" size={24} aria-hidden />
            <h2 className="mt-5 text-xl font-semibold text-ink">No webhook events yet</h2>
            <p className="mt-2 leading-7 text-ink/64">
              After Meta sends DM or comment notifications, they will appear here.
            </p>
          </article>
        )}
      </section>
    </div>
  );
}
