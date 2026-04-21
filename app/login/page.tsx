import Link from "next/link";
import { Mail } from "lucide-react";
import { signInWithEmail } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <Link className="text-xl font-semibold text-ink" href="/">
          RelayKit
        </Link>
        <h1 className="mt-8 text-3xl font-semibold text-ink">Sign in</h1>
        <p className="mt-3 leading-7 text-ink/68">
          Use a magic link to access the SaaS dashboard.
        </p>

        <form action={signInWithEmail} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink" htmlFor="email">
            Email
            <input
              className="rounded-md border border-ink/15 bg-paper px-4 py-3 text-base font-normal outline-none focus:border-moss"
              id="email"
              name="email"
              placeholder="founder@example.com"
              required
              type="email"
            />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-moss px-4 py-3 font-semibold text-white">
            <Mail size={18} aria-hidden />
            Send magic link
          </button>
        </form>

        {params.sent ? (
          <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm text-moss">
            Magic link sent. Check your email.
          </p>
        ) : null}
        {params.error ? (
          <p className="mt-4 rounded-md bg-clay/10 px-4 py-3 text-sm text-clay">
            {params.error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
