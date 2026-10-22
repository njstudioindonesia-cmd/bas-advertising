import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    // 1. Verifikasi CRON_SECRET jika dikonfigurasi
    const envSecret = process.env.CRON_SECRET;
    if (envSecret) {
      const authHeader = request.headers.get("authorization");
      const xSecret = request.headers.get("x-cron-secret");
      const url = new URL(request.url);
      const queryKey = url.searchParams.get("key");

      const token = authHeader?.replace(/^Bearer\s+/i, "") || xSecret || queryKey;
      if (token !== envSecret) {
        return NextResponse.json(
          { success: false, error: "Akses ditolak: CRON_SECRET tidak cocok." },
          { status: 401 }
        );
      }
    }

    // 2. Kirim query ringan ke Supabase untuk menjaga free tier tetap aktif (anti-pause)
    let dbStatus = "connected";
    let dbError = null;

    try {
      const { data, error } = await supabaseAdmin
        .from("settings")
        .select("key")
        .limit(1);

      if (error) {
        dbStatus = "warning";
        dbError = error.message;
      }
    } catch (err: any) {
      dbStatus = "offline_fallback";
      dbError = err.message;
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Cetak.inc heartbeat ping sukses — database Supabase aktif.",
      timestamp: new Date().toISOString(),
      latencyMs,
      database: {
        status: dbStatus,
        error: dbError,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengeksekusi cron ping.",
        latencyMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
