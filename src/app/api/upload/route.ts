import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireAdmin } from "@/lib/auth/guard";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "File gambar tidak ditemukan" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format gambar tidak didukung. Harap gunakan JPEG, PNG, WEBP, atau GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = ".jpg";
    if (file.type === "image/png") ext = ".png";
    else if (file.type === "image/webp") ext = ".webp";
    else if (file.type === "image/gif") ext = ".gif";
    else if (file.type === "image/svg+xml") ext = ".svg";

    const fileName = `uploads/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;

    // 1. Unggah ke Cloud Supabase Storage Bucket 'assets'
    try {
      const { data, error } = await supabaseAdmin.storage
        .from("assets")
        .upload(fileName, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabaseAdmin.storage.from("assets").getPublicUrl(fileName);
        return NextResponse.json({
          success: true,
          message: "Gambar berhasil diunggah ke Supabase Cloud Storage",
          url: publicData.publicUrl,
        });
      }
    } catch (storageErr) {
      console.error("[STORAGE_UPLOAD_ERR] Gagal upload ke Supabase Storage, fallback ke Base64:", storageErr);
    }

    // 2. Fallback Base64 Data URL (Tetap aman & langsung tampil jika koneksi storage bermasalah)
    const mime = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    return NextResponse.json({
      success: true,
      message: "Gambar berhasil diunggah (Base64)",
      url: `data:${mime};base64,${base64Data}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengunggah gambar" },
      { status: 500 }
    );
  }
}
