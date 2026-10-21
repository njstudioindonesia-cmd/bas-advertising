import { NextResponse } from "next/server";
import { getShippingProvider } from "@/adapters/shipping";
import { getActiveHubs } from "@/modules/hubs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toLat, toLng, hubId, subtotal, providerId = "internal-tariff" } = body;

    if (typeof toLat !== "number" || typeof toLng !== "number") {
      return NextResponse.json(
        { success: false, error: "Koordinat tujuan (toLat, toLng) wajib diisi." },
        { status: 400 }
      );
    }

    const hubs = await getActiveHubs();
    const selectedHub = hubId ? hubs.find((h) => h.id === hubId) || hubs[0] : hubs[0];

    const input = {
      from: { lat: selectedHub.lat, lng: selectedHub.lng },
      to: { lat: toLat, lng: toLng },
      hubId: selectedHub.id,
      subtotal: Number(subtotal) || 0,
    };

    // 1. Dapatkan quote dari provider terpilih
    const provider = getShippingProvider(providerId);
    let quote = await provider.quote(input);

    // 2. Jika kurir internal melebihi jangkauan, otomatis tawarkan quote kurir eksternal (manual-quote)
    if (!quote && providerId === "internal-tariff") {
      const fallbackProvider = getShippingProvider("manual-quote");
      quote = await fallbackProvider.quote(input);
    }

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "Pengantaran tidak tersedia untuk jarak ini.",
      });
    }

    // Ambil juga opsi perbandingan (kurir eksternal)
    const externalProvider = getShippingProvider("manual-quote");
    const externalQuote = await externalProvider.quote(input);

    return NextResponse.json({
      success: true,
      data: {
        ...quote,
        hub: {
          id: selectedHub.id,
          name: selectedHub.name,
          slug: selectedHub.slug,
        },
        options: [
          quote,
          externalQuote && externalQuote.providerId !== quote.providerId ? externalQuote : null,
        ].filter(Boolean),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghitung estimasi ongkir." },
      { status: 500 }
    );
  }
}
