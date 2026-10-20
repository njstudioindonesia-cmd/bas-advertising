import { NextResponse } from "next/server";
import { updatePortfolioItem, deletePortfolioItem } from "@/lib/db/queries/portfolio";
import { PortfolioInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth/guard";
import { revalidateEntity } from "@/lib/cache-tags";
import { logAudit } from "@/lib/db/queries/audit";
import { db } from "@/lib/db/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const body = await request.json();
    const partial = PortfolioInputSchema.partial().safeParse(body);

    if (!partial.success) {
      return NextResponse.json(
        { success: false, error: partial.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const updated = updatePortfolioItem(id, partial.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Portofolio tidak ditemukan" }, { status: 404 });
    }

    logAudit({
      actor: "admin",
      action: "UPDATE",
      entity: "portfolio",
      entityId: id,
      diff: partial.data,
    });

    revalidateEntity("portfolio", ["/portofolio", "/"]);

    return NextResponse.json({ success: true, message: "Portofolio berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui portofolio" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const existing = db.prepare("SELECT * FROM portfolio WHERE id = ?").get(id) as any;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Portofolio tidak ditemukan" }, { status: 404 });
    }

    deletePortfolioItem(id);

    logAudit({
      actor: "admin",
      action: "DELETE",
      entity: "portfolio",
      entityId: id,
      diff: { title: existing.title },
    });

    revalidateEntity("portfolio", ["/portofolio", "/"]);

    return NextResponse.json({ success: true, message: "Portofolio berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal menghapus portofolio" }, { status: 500 });
  }
}
