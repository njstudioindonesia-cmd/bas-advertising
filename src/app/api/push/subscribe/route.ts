import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderCode, subscription } = body;

    if (!orderCode || !subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const subId = "sub-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    // Coba simpan ke Supabase table push_subscriptions jika sudah dibuat
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        id: subId,
        order_code: orderCode,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || "",
        auth: subscription.keys?.auth || "",
        created_at: now,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.warn("[PUSH_SUBSCRIPTION_DB_WARN] Table might not exist yet:", error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Push notification subscription berhasil didaftarkan",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register subscription" },
      { status: 500 }
    );
  }
}
