import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/db/queries/portfolio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const items = await getPortfolio(includeInactive);
    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil inspirasi cetak" },
      { status: 500 }
    );
  }
}
