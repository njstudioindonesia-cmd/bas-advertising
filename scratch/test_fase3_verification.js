/**
 * Verification Script for Blueprint V2: Fase 3 — Ongkir & Tarif
 */

const fs = require("fs");
const path = require("path");

// Load .env.local manually if not in process.env
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const { calculateHaversineKm, estimateRoadDistance } = require("../src/modules/geo/distance");
const { HaversineRoutingProvider } = require("../src/adapters/routing/haversine");
const { getShippingTariffs, getShippingTariffByHub } = require("../src/modules/delivery/service");
const { InternalTariffShippingProvider } = require("../src/adapters/shipping/internal-tariff");
const { ManualQuoteShippingProvider } = require("../src/adapters/shipping/manual-quote");

async function runTests() {
  console.log("=== RUNNING FASE 3 VERIFICATION TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Haversine Distance Test
  // Padang Utara (-0.9025, 100.3542) to Lubuk Begalung (-0.9634, 100.3951)
  const dKm = calculateHaversineKm({ lat: -0.9025, lng: 100.3542 }, { lat: -0.9634, lng: 100.3951 });
  assert("Haversine calculates realistic distance (~8.2 km straight line)", dKm > 7.0 && dKm < 9.5);

  const roadEst = estimateRoadDistance({ lat: -0.9025, lng: 100.3542 }, { lat: -0.9634, lng: 100.3951 });
  assert("Road estimation applies 1.3x winding factor", roadEst.distanceKm > dKm);

  // 2. Default Hub Tariffs Test
  const tariffs = await getShippingTariffs();
  assert("Default tariffs loaded with at least 2 hubs", tariffs.length >= 2);
  const hubPusatTariff = tariffs.find(t => t.hubId === "00000000-0000-0000-0000-000000000001");
  assert("Hub Pusat tariff has baseFee 8000 and perKm 2500", hubPusatTariff && hubPusatTariff.baseFee === 8000 && hubPusatTariff.perKm === 2500);

  // 3. Dynamic Calculation & Rp 500 Rounding
  const provider = new InternalTariffShippingProvider();
  const quote1 = await provider.quote({
    from: { lat: -0.9025, lng: 100.3542 },
    to: { lat: -0.9400, lng: 100.3600 },
    subtotal: 50000,
    hubId: "00000000-0000-0000-0000-000000000001"
  });
  assert("Internal tariff quote returns valid price and eta", quote1 && quote1.price > 0 && typeof quote1.etaMin === "number");
  assert("Internal tariff price is rounded to multiple of 500", quote1 && quote1.price % 500 === 0);

  // 4. Free Shipping Promo Rule
  const quoteFree = await provider.quote({
    from: { lat: -0.9025, lng: 100.3542 },
    to: { lat: -0.9400, lng: 100.3600 },
    subtotal: 350000, // Above Rp 300.000 free shipping threshold
    hubId: "00000000-0000-0000-0000-000000000001"
  });
  assert("Orders with subtotal >= Rp 300.000 get free shipping (Rp 0)", quoteFree && quoteFree.price === 0);
  assert("Free shipping notes/label contain promo information", quoteFree && quoteFree.label.toLowerCase().includes("gratis ongkir"));

  // 5. Manual Quote Adapter Test
  const manualProvider = new ManualQuoteShippingProvider();
  const manualQuote = await manualProvider.quote({
    from: { lat: -0.9025, lng: 100.3542 },
    to: { lat: -0.9500, lng: 100.3600 },
    subtotal: 100000,
    hubId: "00000000-0000-0000-0000-000000000001"
  });
  assert("Manual adapter returns provider id 'manual-quote'", manualQuote && manualQuote.providerId === "manual-quote");
  assert("Manual adapter labels confirmation note", manualQuote && manualQuote.label.toLowerCase().includes("eksternal"));

  // 6. Fallback Provider Test
  const fallbackRouting = new HaversineRoutingProvider();
  const fallbackRoute = await fallbackRouting.calculateRoute(
    { lat: -0.8354, lng: 100.3150 },
    { lat: -0.8400, lng: 100.3200 }
  );
  assert("Haversine fallback provider returns isFallback=true and valid duration", fallbackRoute.isFallback === true && fallbackRoute.durationMin >= 10);

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
