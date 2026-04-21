export function SetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="max-w-xl rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Supabase is not configured</h1>
        <p className="mt-4 leading-7 text-ink/68">
          Add the values from your Supabase project to <code>.env.local</code>, then run the SQL in
          <code> supabase/schema.sql</code>. After that, sign in and the dashboard will create your
          first workspace.
        </p>
      </section>
    </main>
  );
}
