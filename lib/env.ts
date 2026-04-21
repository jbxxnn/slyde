export function getEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function getAppUrl() {
  const configuredUrl = getEnv("NEXT_PUBLIC_APP_URL");
  const vercelUrl = getEnv("VERCEL_URL");
  const fallbackUrl = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";

  return (configuredUrl || fallbackUrl).replace(/\/$/, "");
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
