import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const isJwt = serviceKey.startsWith("eyJ");
  const key = isJwt
    ? serviceKey
    : (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");

  if (!key) throw new Error("No Supabase API key found — set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}
