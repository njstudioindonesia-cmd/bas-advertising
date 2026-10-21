import { NextResponse } from "next/server";
import { getActiveGeocoder } from "@/adapters/geocoder";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || searchParams.get("query") || "";

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const geocoder = getActiveGeocoder();
    const results = await geocoder.search(q.trim());

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mencari alamat." },
      { status: 500 }
    );
  }
}
