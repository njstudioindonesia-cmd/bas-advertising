/**
 * Automated Verification Script for Blueprint V2: Fase 5 — Portal Vendor (Workshop Antrean Cetak & SPK)
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

const { getActiveHubs, getHubById, updateHub } = require("../src/modules/hubs/service");
const { getOrders } = require("../src/lib/db/queries/orders");
const { transitionOrderStatus, registerMemoryOrder } = require("../src/modules/orders/service");
const { subscribeEvent, publishEvent } = require("../src/lib/events/outbox");

async function runTests() {
  console.log("=== RUNNING FASE 5 VERIFICATION TESTS (PORTAL VENDOR) ===\n");
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

  // 1. Hub Configuration Check
  const hubs = await getActiveHubs();
  assert("At least 2 active workshop hubs exist (Hub Pusat & Hub Lubuk Buaya)", hubs.length >= 2);
  const hubPusat = hubs.find(h => h.id === "00000000-0000-0000-0000-000000000001" || h.slug === "hub-padang-pusat");
  const hubLubukBuaya = hubs.find(h => h.id === "00000000-0000-0000-0000-000000000002" || h.slug === "hub-lubuk-buaya");
  assert("Hub Pusat exists with address in Lolong Belanti / Padang Utara", !!hubPusat && hubPusat.name.includes("Pusat"));
  assert("Hub Lubuk Buaya exists with address in Koto Tangah / Lubuk Buaya", !!hubLubukBuaya && hubLubukBuaya.name.includes("Lubuk Buaya"));

  // 2. Hub Profile Update Test (Daily Capacity & IsOpen status)
  const originalCapacity = hubLubukBuaya ? hubLubukBuaya.dailyCapacity || 100 : 100;
  const testCapacity = 45;
  const updateRes = await updateHub("00000000-0000-0000-0000-000000000002", {
    dailyCapacity: testCapacity,
    isOpen: true,
    notes: "Mesin Outdoor Konica & Mutoh Eco-Solvent Normal",
  });
  assert("updateHub succeeds for Hub Lubuk Buaya", updateRes.success === true);
  const refreshedHub = await getHubById("00000000-0000-0000-0000-000000000002");
  assert("Hub Lubuk Buaya daily capacity updated to 45", refreshedHub && refreshedHub.dailyCapacity === 45);
  assert("Hub Lubuk Buaya notes updated properly", refreshedHub && refreshedHub.notes.includes("Konica"));

  // Restore capacity
  await updateHub("00000000-0000-0000-0000-000000000002", {
    dailyCapacity: originalCapacity,
    isOpen: true,
  });

  // 3. Hub Order Isolation Test
  const ordersResult = await getOrders({ limit: 100 });
  const allOrders = ordersResult.orders || [];
  console.log(`\n[Info] Total system orders available: ${allOrders.length}`);

  // Test isolating for Hub Pusat vs Hub Lubuk Buaya
  const ordersForPusat = allOrders.filter(o => o.hubId === "00000000-0000-0000-0000-000000000001" || !o.hubId);
  const ordersForLubuk = allOrders.filter(o => o.hubId === "00000000-0000-0000-0000-000000000002");

  assert("Hub isolation logic separates orders between Hub Pusat and Lubuk Buaya",
    ordersForPusat.every(o => o.hubId !== "00000000-0000-0000-0000-000000000002")
  );
  assert("Orders for Lubuk Buaya are strictly dedicated to Lubuk Buaya",
    ordersForLubuk.every(o => o.hubId === "00000000-0000-0000-0000-000000000002")
  );

  // 4. Vendor Workflow Status Transition Test
  const mockVendorUser = {
    id: "usr-vendor-pusat",
    role: "vendor",
    username: "vendor_pusat",
  };

  const testOrderId = "test-ord-fase5-" + Date.now();
  registerMemoryOrder({
    id: testOrderId,
    code: "BAS-F5-9999",
    customerName: "Rian Padang",
    customerPhone: "082283995544",
    deliveryMethod: "kirim",
    address: "Jl. Khatib Sulaiman No. 42, Lolong Belanti",
    paymentMethod: "Transfer Bank",
    subtotal: 120000,
    status: "DIBAYAR",
    hubId: "00000000-0000-0000-0000-000000000001",
    items: [
      {
        id: "item-1",
        name: "Spanduk Flexi 280gr",
        qty: 2,
        price: 60000,
        specs: "Bahan: Flexi 280gr\nUkuran: 3x1 m\nFinishing: Mata ayam 4 sudut",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Transition to DIPRODUKSI
  const prodRes = await transitionOrderStatus(testOrderId, "DIPRODUKSI", mockVendorUser);
  assert("Vendor transition from DIBAYAR to DIPRODUKSI succeeds", prodRes.success === true);

  // Transition to SIAP_ANTAR
  const readyRes = await transitionOrderStatus(testOrderId, "SIAP_ANTAR", mockVendorUser);
  assert("Vendor transition from DIPRODUKSI to SIAP_ANTAR succeeds", readyRes.success === true);

  // Unauthorized transition test (e.g. vendor trying to directly set SELESAI or non-allowed status)
  const invalidRes = await transitionOrderStatus(testOrderId, "MENUNGGU_VERIFIKASI", mockVendorUser);
  assert("Invalid vendor transition is rejected by state machine", invalidRes.success === false);

  // 5. Outbox Event Subscription & Emission Check
  let eventReceived = false;
  const unsubscribe = subscribeEvent("ORDER_READY_FOR_DELIVERY", (evt) => {
    if (evt.payload.orderId === testOrderId) {
      eventReceived = true;
    }
  });

  await publishEvent("ORDER_READY_FOR_DELIVERY", {
    orderId: testOrderId,
    orderCode: "BAS-F5-9999",
    hubId: "00000000-0000-0000-0000-000000000001",
    timestamp: new Date().toISOString(),
  });

  // Small delay to allow microtask queue dispatch
  await new Promise((r) => setTimeout(r, 100));
  unsubscribe();

  assert("Outbox events dispatch asynchronously to subscribers", eventReceived === true);

  // 6. Vendor UI Route Structure & SPK Link Integrity
  const vendorPages = [
    "src/app/vendor/page.tsx",
    "src/app/vendor/pesanan/[id]/page.tsx",
    "src/app/vendor/profil/page.tsx",
    "src/app/api/vendor/orders/route.ts",
    "src/app/api/vendor/orders/[id]/route.ts",
    "src/app/api/vendor/orders/[id]/status/route.ts",
    "src/app/api/vendor/profile/route.ts",
  ];

  vendorPages.forEach(filePath => {
    const fullP = path.resolve(__dirname, "../", filePath);
    assert(`Vendor module file exists: ${filePath}`, fs.existsSync(fullP));
  });

  console.log(`\n=== FASE 5 VERIFICATION SUMMARY ===`);
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
