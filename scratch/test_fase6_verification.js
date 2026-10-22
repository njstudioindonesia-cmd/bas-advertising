/**
 * Automated Verification Script for Blueprint V2: Fase 6 — Portal Driver & Live Tracking (GPS & Leaflet Maps)
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

const {
  setDriverOnlineStatus,
  getDriverOnlineStatus,
  upsertDriverLocation,
  getDriverLocation,
  getDriverLocationByOrderId,
  getDriverTasks,
  claimDeliveryTask,
  updateDeliveryTaskStatus,
  getDriverHistory,
} = require("../src/modules/delivery/service");
const { registerMemoryOrder, getOrderById } = require("../src/modules/orders/service");
const { subscribeEvent } = require("../src/lib/events/outbox");

async function runTests() {
  console.log("=== RUNNING FASE 6 VERIFICATION TESTS (PORTAL DRIVER & LIVE TRACKING) ===\n");
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

  const testDriverId = "driver-test-" + Date.now();
  const testOrderId = "order-fase6-" + Date.now();

  // 1. Driver Online/Offline Shift Status
  await setDriverOnlineStatus(testDriverId, true);
  let status = await getDriverOnlineStatus(testDriverId);
  assert("Driver can toggle duty to ONLINE", status === true);

  await setDriverOnlineStatus(testDriverId, false);
  status = await getDriverOnlineStatus(testDriverId);
  assert("Driver can toggle duty to OFFLINE (istirahat)", status === false);

  await setDriverOnlineStatus(testDriverId, true);

  // 2. Register Test Order for Delivery
  registerMemoryOrder({
    id: testOrderId,
    code: "BAS-F6-7788",
    customerName: "Rian Hidayat",
    customerPhone: "081267890123",
    deliveryMethod: "kirim",
    address: "Jl. Khatib Sulaiman No. 42, Lolong Belanti, Padang Utara",
    paymentMethod: "Transfer Bank",
    subtotal: 185000,
    status: "SIAP_ANTAR",
    hubId: "00000000-0000-0000-0000-000000000001",
    items: [
      {
        id: "it-1",
        name: "Roll Banner 60x160 Albatros",
        qty: 1,
        price: 185000,
        specs: "Bahan: Albatros Doff\nFinishing: Rangka Rollup Aluminium",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 3. Fetch Driver Tasks
  const tasks = await getDriverTasks(testDriverId);
  assert("getDriverTasks returns activeTask and availableTasks lists", Array.isArray(tasks.availableTasks));

  // 4. Driver Claim Task
  const driverInfo = {
    id: testDriverId,
    fullName: "Budi Santoso",
    phone: "082283995544",
    plate: "BA 4821 QA",
  };
  const claimRes = await claimDeliveryTask(testOrderId, driverInfo);
  assert("Driver claims available delivery task", claimRes.success === true);

  // 5. Driver GPS Location Ingestion & Retrieval
  const testLat = -0.9123;
  const testLng = 100.3587;
  const locRes = await upsertDriverLocation(testDriverId, testLat, testLng, 180, 25, testOrderId);
  assert("upsertDriverLocation saves GPS coordinates", locRes.success === true && locRes.location.lat === testLat);

  const locDirect = await getDriverLocation(testDriverId);
  assert("getDriverLocation returns driver's current position", locDirect !== null && locDirect.lat === testLat);

  const locByOrder = await getDriverLocationByOrderId(testOrderId);
  assert("getDriverLocationByOrderId returns live position for order", locByOrder !== null && locByOrder.lat === testLat);

  // 6. Delivery Lifecycle Stepper Transitions:
  // Step A: KURIR_MENJEMPUT -> DALAM_PERJALANAN
  let eventCaught = false;
  const unsub = subscribeEvent("DRIVER_IN_TRANSIT", (evt) => {
    if (evt.payload.orderId === testOrderId) eventCaught = true;
  });

  const transitRes = await updateDeliveryTaskStatus(
    testOrderId,
    "DALAM_PERJALANAN",
    { id: testDriverId, role: "driver", username: "driver_budi" }
  );
  assert("Driver transitions to DALAM_PERJALANAN (in transit)", transitRes.success === true);

  // Step B: DALAM_PERJALANAN -> TIBA
  const arriveRes = await updateDeliveryTaskStatus(
    testOrderId,
    "TIBA",
    { id: testDriverId, role: "driver", username: "driver_budi" }
  );
  assert("Driver transitions to TIBA (arrived at destination)", arriveRes.success === true);

  // Step C: TIBA -> SELESAI (with Proof of Delivery photo)
  const proofUrl = "https://bas-advertising.com/storage/delivery-proofs/proof_123.webp";
  const doneRes = await updateDeliveryTaskStatus(
    testOrderId,
    "SELESAI",
    { id: testDriverId, role: "driver", username: "driver_budi" },
    { proofPhotoUrl: proofUrl }
  );
  assert("Driver completes delivery with proof photo (SELESAI)", doneRes.success === true);

  const orderAfterDone = await getOrderById(testOrderId);
  assert("Order status in DB/memory reflects SELESAI", orderAfterDone.status === "SELESAI");

  // Allow async outbox event dispatch
  await new Promise((r) => setTimeout(r, 100));
  unsub();

  // 7. Driver Delivery History
  const history = await getDriverHistory(testDriverId);
  assert("getDriverHistory returns array of completed tasks", Array.isArray(history));

  // 8. File & Component Integrity Check
  const requiredFiles = [
    "src/app/driver/page.tsx",
    "src/app/driver/login/page.tsx",
    "src/app/driver/tugas/[id]/page.tsx",
    "src/app/driver/riwayat/page.tsx",
    "src/app/api/driver/location/route.ts",
    "src/app/api/driver/tasks/route.ts",
    "src/app/api/driver/tasks/[id]/claim/route.ts",
    "src/app/api/driver/tasks/[id]/status/route.ts",
    "src/app/api/driver/history/route.ts",
    "src/app/api/admin/orders/[id]/assign-driver/route.ts",
    "src/components/LiveOrderTrackingMap.tsx",
  ];

  requiredFiles.forEach((file) => {
    const fullPath = path.resolve(__dirname, "../", file);
    assert(`Required file exists: ${file}`, fs.existsSync(fullPath));
  });

  console.log(`\n=== FASE 6 VERIFICATION SUMMARY ===`);
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
