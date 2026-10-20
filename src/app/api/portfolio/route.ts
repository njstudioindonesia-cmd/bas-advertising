import { NextResponse } from "next/server";
import { getPortfolio, createPortfolioItem } from "@/lib/db/queries/portfolio";
import { PortfolioInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth/guard";
import { revalidateEntity } from "@/lib/cache-tags";
import { logAudit } from "@/lib/db/queries/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const items = getPortfolio(includeInactive);
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memuat portofolio" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const parsed = PortfolioInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Input portofolio tidak valid" },
        { status: 400 }
      );
    }

    const created = createPortfolioItem(parsed.data);

    logAudit({
      actor: "admin",
      action: "CREATE",
      entity: "portfolio",
      entityId: created.id,
      diff: { title: created.title },
    });

    revalidateEntity("portfolio", ["/portofolio", "/"]);

    return NextResponse.json({ success: true, message: "Portofolio berhasil ditambahkan", data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal menambahkan portofolio" }, { status: 500 });
  }
}
