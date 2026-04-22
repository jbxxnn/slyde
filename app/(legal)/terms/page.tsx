import Link from "next/link";

export const metadata = {
  title: "Terms of Service | RelayKit",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <Link className="text-sm font-semibold text-moss" href="/">
        RelayKit
      </Link>
      <h1 className="mt-6 text-4xl font-semibold text-ink">Terms of Service</h1>
      <p className="mt-3 text-sm text-ink/55">Effective date: April 22, 2026</p>

      <div className="mt-8 grid gap-6 leading-7 text-ink/72">
        <section>
          <h2 className="text-xl font-semibold text-ink">Use of RelayKit</h2>
          <p className="mt-2">
            RelayKit provides Instagram messaging and comment automation tools. You are responsible
            for configuring automations accurately and using the service in compliance with
            applicable laws and Meta platform policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Account Responsibility</h2>
          <p className="mt-2">
            You are responsible for maintaining access to your account, connected Instagram assets,
            and workspace settings. You must not use RelayKit for spam, deception, harassment, or
            unauthorized messaging.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Platform Limits</h2>
          <p className="mt-2">
            Instagram APIs are subject to Meta permissions, review, rate limits, messaging windows,
            and feature availability. RelayKit cannot guarantee message delivery where platform
            restrictions apply.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Service Changes</h2>
          <p className="mt-2">
            We may update, pause, or discontinue features as needed for security, compliance,
            reliability, or platform changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Contact</h2>
          <p className="mt-2">
            For support or legal questions, contact the RelayKit operator at the support email listed
            in your app or business profile.
          </p>
        </section>
      </div>
    </article>
  );
}
