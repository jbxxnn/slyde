import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!isProbablyServiceRoleKey(key)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a service_role key. Use the secret service_role key from Supabase API settings.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isProbablyServiceRoleKey(key: string) {
  try {
    const [, payload] = key.split(".");
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8"));

    return decoded.role === "service_role";
  } catch {
    return false;
  }
}
