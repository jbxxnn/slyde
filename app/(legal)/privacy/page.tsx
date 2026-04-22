import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | RelayKit",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <Link className="text-sm font-semibold text-moss" href="/">
        RelayKit
      </Link>
      <h1 className="mt-6 text-4xl font-semibold text-ink">Privacy Policy</h1>
      <p className="mt-3 text-sm text-ink/55">Effective date: April 22, 2026</p>

      <div className="mt-8 grid gap-6 leading-7 text-ink/72">
        <section>
          <h2 className="text-xl font-semibold text-ink">Overview</h2>
          <p className="mt-2">
            RelayKit helps businesses automate responses to Instagram messages and comments. This
            policy explains what information we collect, how we use it, and how users can request
            deletion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Information We Collect</h2>
          <p className="mt-2">
            We collect account information such as email address, workspace details, connected
            Instagram account identifiers, automation rules, webhook event payloads, message/comment
            metadata, and automation logs. We store access tokens needed to provide the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">How We Use Information</h2>
          <p className="mt-2">
            We use information to authenticate users, connect Instagram accounts, receive webhook
            events, match automation rules, send configured replies, display logs, troubleshoot
            delivery, secure the service, and comply with platform requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Sharing</h2>
          <p className="mt-2">
            We do not sell personal information. We share information with service providers only as
            needed to run RelayKit, including hosting, database, authentication, analytics, and Meta
            platform APIs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Data Retention</h2>
          <p className="mt-2">
            We keep account, automation, and event data while a workspace is active or as needed for
            security, debugging, legal, or operational reasons. Users may request deletion at any
            time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Data Deletion</h2>
          <p className="mt-2">
            You can request deletion by following our data deletion instructions. We will delete or
            de-identify account data unless retention is required for legal, security, or abuse
            prevention reasons.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact the RelayKit operator at the support email listed in your
            app or business profile.
          </p>
        </section>
      </div>
    </article>
  );
}
