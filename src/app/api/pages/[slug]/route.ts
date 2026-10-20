import { NextResponse } from "next/server";
import { getPage, setPage } from "@/lib/db/queries/pages";
import { PageInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth/guard";
import { revalidateEntity } from "@/lib/cache-tags";
import { logAudit } from "@/lib/db/queries/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = getPage(slug);
    if (!page) {
      return NextResponse.json({ success: false, error: "Halaman tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memuat halaman" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const { slug } = await params;
    const body = await request.json();
    const parsed = PageInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Input halaman tidak valid" },
        { status: 400 }
      );
    }

    const updated = setPage(slug, parsed.data.title, parsed.data.content);

    logAudit({
      actor: "admin",
      action: "UPDATE",
      entity: "pages",
      entityId: slug,
      diff: { title: parsed.data.title },
    });

    revalidateEntity("pages", [`/${slug}`, "/"]);

    return NextResponse.json({ success: true, message: "Halaman berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui halaman" }, { status: 500 });
  }
}
