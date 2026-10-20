import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/db/queries/audit";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Password lama dan password baru wajib diisi." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    const admin = db.prepare("SELECT * FROM admin_users LIMIT 1").get() as any;
    if (!admin) {
      return NextResponse.json({ success: false, error: "User admin tidak ditemukan." }, { status: 404 });
    }

    const match = verifyPassword(oldPassword, admin.password_hash);
    if (!match) {
      return NextResponse.json({ success: false, error: "Password lama tidak cocok." }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(newHash, admin.id);

    logAudit({
      actor: admin.username,
      action: "CHANGE_PASSWORD",
      entity: "admin_users",
      entityId: admin.id,
    });

    return NextResponse.json({ success: true, message: "Password admin berhasil diperbarui." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal mengubah password." }, { status: 500 });
  }
}
