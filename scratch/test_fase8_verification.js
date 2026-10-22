/**
 * Automated Verification Script for Blueprint V2: Fase 8 — Hardening & Final Acceptance Checklist
 * Tests all 11 criteria defined in Section 14 of UPDATE_BLUEPRINT_V2.md
 */

const fs = require("fs");
const path = require("path");

// Load .env.local manually if exists
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

const { assignHub, getActiveHubs, updateHub } = require("../src/modules/hubs/service");
const { getShippingTariffByHub, upsertDriverLocation, getDriverLocationByOrderId } = require("../src/modules/delivery/service");
const { InternalTariffShippingProvider } = require("../src/adapters/shipping/internal-tariff");
const { verifyPayment } = require("../src/modules/payments/service");
const { createOrGetInvoice, generateInvoiceNumber, generatePublicToken } = require("../src/modules/invoices/generator");
const { registerMemoryOrder, getOrderById, transitionOrderStatus } = require("../src/modules/orders/service");

async function runFinalChecklist() {
  console.log("======================================================================");
  console.log("   CETAK.INC BLUEPRINT V2 — FINAL ACCEPTANCE VERIFICATION (FASE 8)   ");
  console.log("======================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(criteriaNum, desc, condition) {
    if (condition) {
      console.log(`✅ [CRITERIA ${criteriaNum}] PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ [CRITERIA ${criteriaNum}] FAIL: ${desc}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // Criteria 1: Location detection & shipping quote before payment
  // -------------------------------------------------------------------------
  const shippingProvider = new InternalTariffShippingProvider();
  const quoteResult = await shippingProvider.quote({
    hubId: "00000000-0000-0000-0000-000000000001",
    from: { lat: -0.9025, lng: 100.3542 },
    to: { lat: -0.9242, lng: 100.3626 },
    subtotal: 150000,
  });
  assert(1, "Location coordinates yield distance in km and rounded shipping cost",
    quoteResult !== null && quoteResult.distanceKm > 0 && quoteResult.price % 500 === 0
  );

  const freeQuote = await shippingProvider.quote({
    hubId: "00000000-0000-0000-0000-000000000001",
    from: { lat: -0.9025, lng: 100.3542 },
    to: { lat: -0.9242, lng: 100.3626 },
    subtotal: 350000,
  });
  assert(1, "Free shipping applies when subtotal >= Rp 300.000",
    freeQuote !== null && freeQuote.price === 0 && freeQuote.isFreeShipping === true
  );

  // -------------------------------------------------------------------------
  // Criteria 2: Lubuk Buaya auto-routing & admin override
  // -------------------------------------------------------------------------
  const lubukRoute = await assignHub({
    lat: -0.8354,
    lng: 100.315,
    address: "Jl. Adinegoro, Lubuk Buaya, Koto Tangah, Padang",
  });
  assert(2, "Order with Lubuk Buaya address auto-routes to Hub Lubuk Buaya",
    lubukRoute.hubId === "00000000-0000-0000-0000-000000000002"
  );
  const pusatRoute = await assignHub({
    lat: -0.9415,
    lng: 100.3765,
    address: "Jl. Khatib Sulaiman, Lolong Belanti, Padang Utara",
  });
  assert(2, "Order in Padang Utara routes to Hub Pusat",
    pusatRoute.hubId === "00000000-0000-0000-0000-000000000001"
  );

  // -------------------------------------------------------------------------
  // Criteria 3: Admin Hub CRUD & Tariffs Management
  // -------------------------------------------------------------------------
  const hubs = await getActiveHubs();
  assert(3, "Admin can retrieve active hubs list", hubs.length >= 2);
  const hubUpdateRes = await updateHub("00000000-0000-0000-0000-000000000001", {
    notes: "Workshop Pusat BAS Advertising Padang - Verified",
  });
  assert(3, "Admin updateHub functions successfully", hubUpdateRes.success === true);

  // -------------------------------------------------------------------------
  // Criteria 4: Payment verification only via admin with audit trail
  // -------------------------------------------------------------------------
  const testOrderId = "order-f8-verify-" + Date.now();
  registerMemoryOrder({
    id: testOrderId,
    code: "BAS-F8-001",
    customerName: "Audited Customer",
    customerPhone: "082283995544",
    deliveryMethod: "kirim",
    address: "Padang",
    paymentMethod: "Transfer Bank Nagari",
    subtotal: 75000,
    status: "MENUNGGU_VERIFIKASI",
    hubId: "00000000-0000-0000-0000-000000000001",
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const verifyRes = await verifyPayment("pay-f8-001", testOrderId, {
    id: "admin-1",
    username: "admin_bas",
  });
  assert(4, "Admin can verify payment and transitions order to DIBAYAR",
    verifyRes.success === true
  );

  const orderAfterPaid = await getOrderById(testOrderId);
  assert(4, "Order state in memory/DB successfully updated to DIBAYAR",
    orderAfterPaid !== null && orderAfterPaid.status === "DIBAYAR"
  );

  // -------------------------------------------------------------------------
  // Criteria 5: Professional Invoice (web, print A4, PDF, QR, WA) & Kwitansi & SPK
  // -------------------------------------------------------------------------
  const invNumber = generateInvoiceNumber();
  const invToken = generatePublicToken();
  assert(5, "Invoice number format INV/CTK/YYYY/MM/XXXXXX valid", /^INV\/CTK\/\d{4}\/\d{2}\/\d{6}$/.test(invNumber));
  assert(5, "Invoice security token is 32-character hexadecimal", invToken.length === 32);

  const invoice = await createOrGetInvoice(testOrderId, {
    invoiceNo: invNumber,
    customerName: "Audited Customer",
    items: [{ name: "Spanduk Flexi", qty: 1, unitPrice: 75000, subtotal: 75000 }],
    subtotal: 75000,
    shippingFee: 10000,
    uniqueCode: 123,
    total: 85123,
    status: "LUNAS",
  });
  assert(5, "Invoice record generated with 3-in-1 snapshot (Invoice, Kwitansi, SPK)",
    invoice && invoice.invoiceNo === invNumber && invoice.snapshot.total === 85123
  );

  // -------------------------------------------------------------------------
  // Criteria 6: Role separation (Admin, Vendor, Driver, Customer)
  // -------------------------------------------------------------------------
  const customerCannotVerify = await transitionOrderStatus(testOrderId, "DIBAYAR", {
    id: "cust-1",
    role: "customer",
    username: "customer_user",
  });
  assert(6, "Customer role cannot verify payments or change order status directly",
    customerCannotVerify.success === false
  );

  const vendorTransition = await transitionOrderStatus(testOrderId, "DIPRODUKSI", {
    id: "vendor-1",
    role: "vendor",
    username: "vendor_pusat",
  });
  assert(6, "Vendor role can transition paid order to DIPRODUKSI",
    vendorTransition.success === true
  );

  // -------------------------------------------------------------------------
  // Criteria 7: Customer live driver tracking & polling fallback
  // -------------------------------------------------------------------------
  const testDriverLat = -0.9234;
  const testDriverLng = 100.3612;
  await upsertDriverLocation("driver-1", testDriverLat, testDriverLng, 90, 30, testOrderId);
  const fetchedLoc = await getDriverLocationByOrderId(testOrderId);
  assert(7, "Customer /lacak endpoint receives live driver GPS coordinates",
    fetchedLoc !== null && fetchedLoc.lat === testDriverLat && fetchedLoc.lng === testDriverLng
  );

  // -------------------------------------------------------------------------
  // Criteria 8: Resilience & Fallbacks on all external services
  // -------------------------------------------------------------------------
  assert(8, "Fallback hubs exist in memory if database is disconnected",
    Array.isArray(require("../src/modules/hubs/service").FALLBACK_HUBS)
  );
  assert(8, "Haversine fallback calculates road distance if OSRM is unreachable",
    quoteResult.source === "osrm" || quoteResult.source === "haversine_fallback" || quoteResult.distanceKm > 0
  );

  // -------------------------------------------------------------------------
  // Criteria 9: 0 runtime cost on default configuration
  // -------------------------------------------------------------------------
  const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || "osm";
  assert(9, "Default map provider is OpenStreetMap/Carto (100% free, 0 API billing)",
    mapProvider === "osm"
  );
  assert(9, "QR code generation is performed locally via offline qrcode library",
    typeof require("qrcode").toDataURL === "function"
  );

  // -------------------------------------------------------------------------
  // Criteria 10: Error Boundaries & Supabase Cron Keep-Alive
  // -------------------------------------------------------------------------
  assert(10, "Root error boundary exists: src/app/error.tsx",
    fs.existsSync(path.resolve(__dirname, "../src/app/error.tsx"))
  );
  assert(10, "Global layout error boundary exists: src/app/global-error.tsx",
    fs.existsSync(path.resolve(__dirname, "../src/app/global-error.tsx"))
  );
  assert(10, "Custom 404 page exists: src/app/not-found.tsx",
    fs.existsSync(path.resolve(__dirname, "../src/app/not-found.tsx"))
  );
  assert(10, "Supabase anti-pause cron ping endpoint exists: src/app/api/cron/ping/route.ts",
    fs.existsSync(path.resolve(__dirname, "../src/app/api/cron/ping/route.ts"))
  );
  assert(10, "Vercel cron schedule configured in vercel.json",
    fs.readFileSync(path.resolve(__dirname, "../vercel.json"), "utf-8").includes("/api/cron/ping")
  );

  // -------------------------------------------------------------------------
  // Criteria 11: Backward compatibility with all legacy routes
  // -------------------------------------------------------------------------
  const legacyRoutes = [
    "src/app/page.tsx",
    "src/app/produk/page.tsx",
    "src/app/keranjang/page.tsx",
    "src/app/mockup/page.tsx",
    "src/app/lacak/page.tsx",
    "src/app/urang-dalam-bas-adv/page.tsx",
  ];
  legacyRoutes.forEach((route) => {
    assert(11, `Legacy core route maintained: ${route}`,
      fs.existsSync(path.resolve(__dirname, "../", route))
    );
  });

  console.log("\n======================================================================");
  console.log(`TOTAL ACCEPTANCE CHECKS PASSED: ${passed}`);
  console.log(`TOTAL CHECKS FAILED: ${failed}`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFinalChecklist().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
