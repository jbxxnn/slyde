import Link from "next/link";
import { FlaskConical, MessageSquareText } from "lucide-react";
import { runCommentApiTest, runDmSimulation } from "./actions";

export const dynamic = "force-dynamic";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const params = await searchParams;
  const result = params.result ? safeParse(params.result) : null;

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Test</p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Automation simulation</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/64">
          Simulate a DM containing "guide" against the connected Instagram account to verify rule
          matching, run logging, and send behavior.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <form action={runDmSimulation}>
          <button className="inline-flex items-center gap-2 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white">
            <FlaskConical size={17} aria-hidden />
            Simulate guide DM
          </button>
        </form>

        <form action={runCommentApiTest} className="mt-3">
          <button className="inline-flex items-center gap-2 rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold text-ink">
            <MessageSquareText size={17} aria-hidden />
            Test comments API
          </button>
        </form>

        {result ? (
          <pre className="mt-5 overflow-auto rounded-md bg-ink p-4 text-sm leading-6 text-white">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </section>

      <div className="mt-6 flex gap-3">
        <Link className="rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold" href="/dashboard">
          Dashboard
        </Link>
        <Link className="rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold" href="/dashboard/inbox">
          Inbox
        </Link>
      </div>
    </div>
  );
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { raw: value };
  }
}
