import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/db/queries/audit";

export async function GET(request: Request) {
  try {
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

    const [catRes, prodRes, banRes, setRes, portRes, hubRes, ordRes] = await Promise.all([
      supabaseAdmin.from("categories").select("id").limit(100),
      supabaseAdmin.from("products").select("id").limit(100),
      supabaseAdmin.from("banners").select("id").limit(100),
      supabaseAdmin.from("settings").select("key").limit(100),
      supabaseAdmin.from("portfolio").select("id").limit(100),
      supabaseAdmin.from("hubs").select("id").limit(100),
      supabaseAdmin.from("orders").select("id").limit(100),
    ]);

    const backupSummary = {
      timestamp: new Date().toISOString(),
      system: "Cetak.inc Database Snapshot",
      counts: {
        categories: catRes.data?.length || 0,
        products: prodRes.data?.length || 0,
        banners: banRes.data?.length || 0,
        settings: setRes.data?.length || 0,
        portfolio: portRes.data?.length || 0,
        hubs: hubRes.data?.length || 0,
        orders: ordRes.data?.length || 0,
      },
    };

    logAudit({
      actor: "system_cron",
      action: "AUTO_BACKUP_SNAPSHOT",
      entity: "DATABASE",
      diff: backupSummary.counts,
    });

    return NextResponse.json({
      success: true,
      message: "Snapshot backup mingguan berhasil disinkronkan.",
      data: backupSummary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat snapshot backup." },
      { status: 500 }
    );
  }
}
