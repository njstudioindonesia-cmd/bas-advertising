import { ShippingProvider, ShippingQuoteInput, ShippingQuoteResult } from "./types";
import { getActiveRoutingProvider } from "../routing";

export class InternalTariffShippingProvider implements ShippingProvider {
  id = "internal-tariff";
  name = "Kurir Internal Workshop Cetak.inc";

  private baseFee = 8000; // Rp 8.000 tarif dasar (jarak 0 - 2 km pertama)
  private perKm = 2500; // Rp 2.500 per km berikutnya
  private minFee = 8000;
  private maxKm = 25; // Batas jangkauan kurir internal

  async quote(input: ShippingQuoteInput): Promise<ShippingQuoteResult | null> {
    const router = getActiveRoutingProvider();
    const route = await router.calculateRoute(input.from, input.to);

    if (route.distanceKm > this.maxKm) {
      // Melebihi radius kurir internal
      return null;
    }

    // Periksa apakah berhak gratis ongkir (misal order > Rp 300.000)
    if (input.subtotal && input.subtotal >= 300000) {
      return {
        providerId: this.id,
        price: 0,
        etaMin: route.durationMin,
        label: "Kurir Internal (Gratis Ongkir Promo)",
        distanceKm: route.distanceKm,
        isFreeShipping: true,
      };
    }

    // Hitung tarif: base fee + tambahan per km jika > 2 km
    const extraKm = Math.max(0, route.distanceKm - 2);
    const rawPrice = this.baseFee + extraKm * this.perKm;

    // Bulatkan ke kelipatan Rp 500 terdekat
    const roundedPrice = Math.max(this.minFee, Math.ceil(rawPrice / 500) * 500);

    return {
      providerId: this.id,
      price: roundedPrice,
      etaMin: route.durationMin,
      label: `Kurir Internal Percetakan (${route.distanceKm} km)`,
      distanceKm: route.distanceKm,
    };
  }
}
