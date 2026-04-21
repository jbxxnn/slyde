import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "DM keyword replies",
    body: "Reply automatically when someone sends a matching Instagram message.",
  },
  {
    icon: Zap,
    title: "Comment-to-DM",
    body: "Send a private reply when a post or Reel comment matches a campaign keyword.",
  },
  {
    icon: ShieldCheck,
    title: "Review-ready flow",
    body: "Keep OAuth, webhooks, logs, and permissions visible for Meta app review.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-semibold tracking-normal text-ink">RelayKit</div>
          <Link
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            href="/login"
          >
            Start
            <ArrowRight size={16} aria-hidden />
          </Link>
        </nav>

        <div className="grid items-end gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-moss">
              Instagram automation SaaS
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-ink sm:text-6xl lg:text-7xl">
              RelayKit
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
              A focused Manychat-style MVP for Instagram DM keyword replies,
              comment private replies, account connection, automation rules, and reviewable logs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-md bg-moss px-5 py-3 text-sm font-semibold text-white"
                href="/login"
              >
                Open dashboard
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                className="inline-flex items-center rounded-md border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                href="/api/meta/webhook"
              >
                Webhook endpoint
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {features.map((feature) => (
              <article
                className="rounded-lg border border-ink/10 bg-white/72 p-5 shadow-soft backdrop-blur"
                key={feature.title}
              >
                <feature.icon className="mb-4 text-clay" size={24} aria-hidden />
                <h2 className="text-lg font-semibold text-ink">{feature.title}</h2>
                <p className="mt-2 leading-7 text-ink/68">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-ink/10 pt-5 text-sm text-ink/60 sm:grid-cols-3">
          <span>Supabase Auth</span>
          <span>Postgres automation data</span>
          <span>Meta OAuth and webhooks</span>
        </div>
      </section>
    </main>
  );
}
