import { NextResponse } from "next/server";
import { getShippingProvider } from "@/adapters/shipping";
import { getActiveHubs } from "@/modules/hubs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toLat, toLng, hubId, subtotal } = body;

    if (typeof toLat !== "number" || typeof toLng !== "number") {
      return NextResponse.json(
        { success: false, error: "Koordinat tujuan (toLat, toLng) wajib diisi." },
        { status: 400 }
      );
    }

    const hubs = await getActiveHubs();
    const selectedHub = hubId ? hubs.find((h) => h.id === hubId) || hubs[0] : hubs[0];

    const provider = getShippingProvider("internal-tariff");
    const quote = await provider.quote({
      from: { lat: selectedHub.lat, lng: selectedHub.lng },
      to: { lat: toLat, lng: toLng },
      hubId: selectedHub.id,
      subtotal: Number(subtotal) || 0,
    });

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "Jarak pengantaran melebihi jangkauan maksimal kurir instan.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...quote,
        hub: {
          id: selectedHub.id,
          name: selectedHub.name,
          slug: selectedHub.slug,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghitung estimasi ongkir." },
      { status: 500 }
    );
  }
}
