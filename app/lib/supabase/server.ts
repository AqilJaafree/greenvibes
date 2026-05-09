import { createClient } from "@supabase/supabase-js";

// Service-role client for Route Handlers
// Falls back to publishable key if service role key is not a valid JWT (dev only)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const isJwt = serviceKey.startsWith("eyJ");
  const key = isJwt
    ? serviceKey
    : (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  );
}
