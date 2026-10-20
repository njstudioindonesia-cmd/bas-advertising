import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db/queries/products";
import { ProductInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth/guard";
import { revalidateEntity } from "@/lib/cache-tags";
import { logAudit } from "@/lib/db/queries/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memuat produk" }, { status: 500 });
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

    const partialSchema = ProductInputSchema.partial();
    const parsed = partialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Data produk tidak valid",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const updated = updateProduct(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan" }, { status: 404 });
    }

    logAudit({
      actor: "admin",
      action: "UPDATE",
      entity: "products",
      entityId: id,
      diff: parsed.data,
    });

    revalidateEntity("products", ["/", "/produk", `/produk/${id}`, `/produk/${updated.slug}`]);

    return NextResponse.json({ success: true, message: "Produk berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui produk" }, { status: 500 });
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const existing = getProductById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan" }, { status: 404 });
    }

    deleteProduct(id, !permanent);

    logAudit({
      actor: "admin",
      action: permanent ? "HARD_DELETE" : "SOFT_DELETE",
      entity: "products",
      entityId: id,
      diff: { name: existing.name },
    });

    revalidateEntity("products", ["/", "/produk", `/produk/${id}`]);

    return NextResponse.json({
      success: true,
      message: permanent ? "Produk dihapus secara permanen" : "Produk dinonaktifkan",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal menghapus produk" }, { status: 500 });
  }
}
