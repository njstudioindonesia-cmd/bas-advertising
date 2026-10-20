import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { revalidateEntity } from "@/lib/cache-tags";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/db/queries/audit";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "Daftar ID produk wajib disertakan." }, { status: 400 });
    }

    const placeholders = ids.map(() => "?").join(",");
    const now = new Date().toISOString();

    if (action === "activate") {
      db.prepare(`UPDATE products SET is_active = 1, updated_at = ? WHERE id IN (${placeholders})`).run(now, ...ids);
    } else if (action === "deactivate") {
      db.prepare(`UPDATE products SET is_active = 0, updated_at = ? WHERE id IN (${placeholders})`).run(now, ...ids);
    } else if (action === "delete") {
      db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...ids);
    } else {
      return NextResponse.json({ success: false, error: "Aksi tidak dikenal" }, { status: 400 });
    }

    logAudit({
      actor: "admin",
      action: `BULK_${action.toUpperCase()}`,
      entity: "products",
      diff: { count: ids.length, ids },
    });

    revalidateEntity("products");

    return NextResponse.json({
      success: true,
      message: `Aksi ${action} berhasil diterapkan pada ${ids.length} produk.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memproses aksi massal" }, { status: 500 });
  }
}
