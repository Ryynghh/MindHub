import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client menggunakan Service Role Key untuk bypass RLS
// HANYA gunakan di server-side (Server Actions, API Routes, atau Server Components)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
