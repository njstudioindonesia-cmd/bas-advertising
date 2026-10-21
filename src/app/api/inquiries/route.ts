import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guard";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { success: false, error: "Nama dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const id = "inq-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin.from("inquiries").insert({
      id,
      name,
      email: email || null,
      phone: phone || null,
      message,
      status: "BELUM_DIBACA",
      created_at: now,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Pesan Anda berhasil dikirim ke tim Cetak.inc!", id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengirim pesan" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat pesan" },
      { status: 500 }
    );
  }
}
