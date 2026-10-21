import { NextResponse } from "next/server";
import { getBannerById, updateBanner, deleteBanner } from "@/lib/db/queries/banners";
import { BannerInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth/guard";
import { revalidateEntity } from "@/lib/cache-tags";
import { logAudit } from "@/lib/db/queries/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const banner = await getBannerById(id);
    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: banner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memuat banner" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { id } = await params;
    const body = await request.json();
    const partial = BannerInputSchema.partial().safeParse(body);

    if (!partial.success) {
      return NextResponse.json(
        { success: false, error: partial.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const updated = await updateBanner(id, partial.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Banner tidak ditemukan" }, { status: 404 });
    }

    logAudit({
      actor: "admin",
      action: "UPDATE",
      entity: "banners",
      entityId: id,
      diff: partial.data,
    });

    revalidateEntity("banners");

    return NextResponse.json({ success: true, message: "Banner berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui banner" }, { status: 500 });
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
    const existing = await getBannerById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Banner tidak ditemukan" }, { status: 404 });
    }

    await deleteBanner(id);

    logAudit({
      actor: "admin",
      action: "DELETE",
      entity: "banners",
      entityId: id,
      diff: { title: existing.title },
    });

    revalidateEntity("banners");

    return NextResponse.json({ success: true, message: "Banner berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal menghapus banner" }, { status: 500 });
  }
}
