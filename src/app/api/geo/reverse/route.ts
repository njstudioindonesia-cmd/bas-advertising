import { NextResponse } from "next/server";
import { getActiveGeocoder } from "@/adapters/geocoder";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { success: false, error: "Parameter lat dan lng wajib diisi." },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: "Nilai lat atau lng tidak valid." },
        { status: 400 }
      );
    }

    const geocoder = getActiveGeocoder();
    const result = await geocoder.reverse({ lat, lng });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan reverse geocoding." },
      { status: 500 }
    );
  }
}
