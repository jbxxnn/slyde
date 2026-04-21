export function getEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function getAppUrl() {
  return getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000").replace(/\/$/, "");
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
