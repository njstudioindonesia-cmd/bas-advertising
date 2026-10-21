import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Supabase Admin Client dengan Service Role Key.
 * Digunakan secara eksklusif di server-side (Next.js Route Handlers / Server Actions)
 * untuk melakukan operasi CRUD penuh dan bypass Row Level Security (RLS).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
