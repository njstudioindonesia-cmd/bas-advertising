import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "bas_adv_revalidate_secret_padang_2026";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ success: false, message: "Unauthorized secret" }, { status: 401 });
    }

    // Revalidate Next.js cache for core public pages
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/produk", "page");
    (revalidateTag as any)("products");
    (revalidateTag as any)("categories");
    (revalidateTag as any)("banners");
    (revalidateTag as any)("portfolio");
    (revalidateTag as any)("settings");

    return NextResponse.json({
      success: true,
      message: "Cache storefront berhasil dibersihkan",
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
