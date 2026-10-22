import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-offline.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-service-key";

/**
 * Circuit Breaker State
 * Mencegah proses / API route menggantung puluhan detik saat koneksi Supabase offline/unreachable
 */
let isCircuitOpen = false;
let circuitOpenedAt = 0;
const CIRCUIT_RESET_MS = 30000; // 30 detik

/**
 * Custom Fetch dengan timeout 1500ms dan Circuit Breaker otomatis.
 */
const fetchWithCircuitBreaker = async (url: any, options: any = {}) => {
  const now = Date.now();
  if (isCircuitOpen) {
    if (now - circuitOpenedAt > CIRCUIT_RESET_MS) {
      isCircuitOpen = false; // Coba kembali (half-open probe)
    } else {
      throw new TypeError("Supabase Circuit Breaker OPEN (remote host unreachable)");
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 800);

  if (options?.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    isCircuitOpen = true;
    circuitOpenedAt = Date.now();
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Supabase Admin Client dengan Service Role Key & Circuit Breaker.
 * Digunakan secara eksklusif di server-side (Next.js Route Handlers / Server Actions)
 * untuk melakukan operasi CRUD penuh dan bypass Row Level Security (RLS).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: fetchWithCircuitBreaker,
  },
});
