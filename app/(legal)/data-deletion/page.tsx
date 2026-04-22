import Link from "next/link";

export const metadata = {
  title: "Data Deletion | RelayKit",
};

export default function DataDeletionPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <Link className="text-sm font-semibold text-moss" href="/">
        RelayKit
      </Link>
      <h1 className="mt-6 text-4xl font-semibold text-ink">Data Deletion Instructions</h1>
      <p className="mt-3 text-sm text-ink/55">Effective date: April 22, 2026</p>

      <div className="mt-8 grid gap-6 leading-7 text-ink/72">
        <section>
          <h2 className="text-xl font-semibold text-ink">Request Deletion</h2>
          <p className="mt-2">
            To request deletion of your RelayKit account, workspace, connected Instagram account
            data, automation rules, webhook events, and logs, contact the RelayKit operator at the
            support email listed in your app or business profile.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">What To Include</h2>
          <p className="mt-2">
            Include the email address used for RelayKit, your workspace name, and the Instagram
            username connected to the workspace. We may ask you to verify ownership before deleting
            data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Processing</h2>
          <p className="mt-2">
            After verification, we will delete or de-identify applicable data unless retention is
            required for legal, security, audit, or abuse prevention reasons.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Disconnect Instagram</h2>
          <p className="mt-2">
            You can also remove RelayKit access from your Instagram or Meta account settings under
            connected apps and websites.
          </p>
        </section>
      </div>
    </article>
  );
}
