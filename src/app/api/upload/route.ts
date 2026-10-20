import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { requireAdmin } from "@/lib/auth/guard";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

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
        { success: false, error: "Ukuran file terlalu besar. Maksimal ukuran gambar adalah 3 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Jika di Vercel atau read-only environment: gunakan Base64 Data URL aman yang bisa disimpan langsung di DB
    const isVercel = Boolean(process.env.VERCEL);
    if (isVercel) {
      const mime = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      return NextResponse.json({
        success: true,
        message: "Gambar berhasil diunggah (Serverless Storage)",
        url: `data:${mime};base64,${base64Data}`,
      });
    }

    // Untuk lingkungan lokal / VPS tradisional: simpan ke public/uploads/
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      let ext = ".jpg";
      if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
      else if (file.type === "image/gif") ext = ".gif";

      const hashName = crypto.randomBytes(16).toString("hex") + ext;
      const filePath = path.join(uploadDir, hashName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${hashName}`;

      return NextResponse.json({
        success: true,
        message: "Gambar berhasil diunggah",
        url: publicUrl,
      });
    } catch {
      // Fallback otomatis ke Base64 jika filesystem read-only
      const mime = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      return NextResponse.json({
        success: true,
        message: "Gambar berhasil diunggah",
        url: `data:${mime};base64,${base64Data}`,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal mengunggah gambar" }, { status: 500 });
  }
}
