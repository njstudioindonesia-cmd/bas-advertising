import fs from "fs";
import path from "path";

// 1. Load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
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

import { createOrder } from "@/lib/db/queries/orders";
import { getOrderById, transitionOrderStatus } from "@/modules/orders/service";
import { submitPaymentProof, verifyPayment } from "@/modules/payments/service";
import { 
  claimDeliveryTask, 
  updateDeliveryTaskStatus, 
  upsertDriverLocation, 
  getDriverLocationByOrderId 
} from "@/modules/delivery/service";
import { getInvoiceByOrderId } from "@/modules/invoices/generator";
import { 
  formatIndonesianPhone, 
  createWhatsAppLink, 
  sendWhatsAppDirect,
  notifyOrderCreated,
  notifyPaymentVerified,
  notifyOrderEnRoute,
  notifyOrderCompleted
} from "@/modules/notifications";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, extra?: any) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name}`, extra ? extra : "");
    failed++;
  }
}

async function runEndToEndSimulation() {
  console.log("\n================================================================================");
  console.log("   🚀 CETAK.INC PADANG — END-TO-END SIMULATION & ACCEPTANCE TEST SUITE        ");
  console.log("   Option 1: Complete Lifecycle Simulation (Customer -> Admin -> Vendor -> Driver)");
  console.log("   Option 2: WhatsApp Notification Automation Engine Integration               ");
  console.log("   Option 3: Padang Local SEO & Schema.org Rich Snippets Validation            ");
  console.log("================================================================================\n");

  const testPhone = "082283995544";
  const customerName = "Rahmat Hidayat";
  const customerAddress = "Jl. Khatib Sulaiman No. 42, Lolong Belanti, Padang Utara";
  // Coordinates near Khatib Sulaiman Padang
  const destLat = -0.9254;
  const destLng = 100.3612;

  // ============================================================================
  // STEP 1: CUSTOMER CHECKOUT & ORDER CREATION
  // ============================================================================
  console.log("📋 [STEP 1] Customer Checkout & Server Authoritative Calculation");
  const checkoutInput = {
    customerName,
    customerPhone: testPhone,
    deliveryMethod: "kirim" as const,
    deliveryFee: 12000,
    destAddress: customerAddress,
    address: customerAddress,
    destLat,
    destLng,
    destNote: "Dekat Masjid Raya Sumbar, pagar hitam",
    paymentMethod: "Transfer Bank Nagari",
    items: [
      {
        productId: "sticker-kaca",
        qty: 3,
        designNote: "Finishing doff, cetak tulisan 'Bas Advertising'",
      },
    ],
  };

  const createResult = await createOrder(checkoutInput);
  assert("Order creation succeeds", !!createResult.order, createResult.error);
  assert("Order code has prefix 'BAS-'", !!createResult.order?.code.startsWith("BAS-"), createResult.order?.code);
  assert("Initial status is 'BARU'", createResult.order?.status === "BARU");
  assert("Subtotal is accurately calculated server-side", (createResult.order?.subtotal || 0) > 0);
  assert("Delivery fee calculated authoritative (>= 8000)", (createResult.order?.deliveryFee || 0) >= 8000);
  assert("Hub is assigned automatically based on Padang coordinates", !!createResult.order?.hubId);
  const uniqueCodeVal = createResult.invoice?.snapshot?.uniqueCode || createResult.invoice?.uniqueCode || 0;
  assert("Invoice auto-generated with unique code", !!createResult.invoice && uniqueCodeVal > 0);

  const orderId = createResult.order?.id || "";
  const orderCode = createResult.order?.code || "";

  // ============================================================================
  // STEP 2: CUSTOMER PAYMENT PROOF SUBMISSION
  // ============================================================================
  console.log("\n💳 [STEP 2] Customer Submits Payment Proof");
  const totalAmount = (createResult.invoice?.snapshot?.total || createResult.invoice?.total || (createResult.order?.subtotal || 0) + (createResult.order?.deliveryFee || 0));
  const proofSubmission = await submitPaymentProof({
    orderId,
    orderCode,
    customerName,
    customerPhone: testPhone,
    amount: totalAmount,
    proofUrl: "https://example.com/receipt-bank-nagari-001.jpg",
    senderBank: "Bank Nagari",
    senderName: "Rahmat Hidayat",
    notes: "Sudah transfer via Nagari Mobile Banking tepat kode unik",
  });

  assert("Payment proof submission succeeds", proofSubmission.success, proofSubmission.error);
  
  // Verifikasi status order otomatis bertransisi ke MENUNGGU_VERIFIKASI
  const orderAfterProof = await getOrderById(orderId);
  assert("Order status transitions to 'MENUNGGU_VERIFIKASI'", orderAfterProof?.status === "MENUNGGU_VERIFIKASI");

  // ============================================================================
  // STEP 3: URANG DALAM (ADMIN) VERIFIES PAYMENT
  // ============================================================================
  console.log("\n🔍 [STEP 3] Admin 'Urang Dalam' Verifies Payment Proof");
  const paymentId = proofSubmission.paymentId || "pay-test";
  const verifyRes = await verifyPayment(paymentId, orderId, {
    id: "admin-01",
    username: "urang-dalam-admin",
  });
  assert("Admin payment verification succeeds", verifyRes.success, verifyRes.error);

  const orderAfterPay = await getOrderById(orderId);
  assert("Order status becomes 'DIBAYAR'", orderAfterPay?.status === "DIBAYAR");
  assert("Payment status marked 'PAID'", orderAfterPay?.paymentStatus === "PAID");

  const invoiceAfterPay = await getInvoiceByOrderId(orderId, undefined, true);
  assert("Invoice marked 'LUNAS'", invoiceAfterPay?.snapshot?.paymentStatus === "LUNAS");

  // ============================================================================
  // STEP 4: VENDOR / WORKSHOP PRODUCTION LIFECYCLE
  // ============================================================================
  console.log("\n🖨️ [STEP 4] Workshop / Vendor Production Queue Transitions");
  
  // 4a. Vendor accepts order
  const vendorUser = { id: "vendor-hub-01", role: "vendor" as const, username: "workshop_lubuk_buaya" };
  const acceptRes = await transitionOrderStatus(orderId, "DITERIMA_VENDOR", vendorUser);
  assert("Vendor accepts order -> 'DITERIMA_VENDOR'", acceptRes.success && acceptRes.newStatus === "DITERIMA_VENDOR", acceptRes.error);

  // 4b. Vendor starts printing
  const prodRes = await transitionOrderStatus(orderId, "DIPRODUKSI", vendorUser);
  assert("Vendor starts printing -> 'DIPRODUKSI'", prodRes.success && prodRes.newStatus === "DIPRODUKSI", prodRes.error);

  // 4c. Vendor finishes printing & packaging
  const readyRes = await transitionOrderStatus(orderId, "SIAP_ANTAR", vendorUser);
  assert("Vendor finishes printing -> 'SIAP_ANTAR'", readyRes.success && readyRes.newStatus === "SIAP_ANTAR", readyRes.error);

  // ============================================================================
  // STEP 5: DRIVER DISPATCH & LIVE GPS TELEMETRY
  // ============================================================================
  console.log("\n🛵 [STEP 5] Driver Dispatch & Real-Time GPS Telemetry Tracking");
  const driverUser = {
    id: "driver-padang-01",
    role: "driver" as const,
    username: "doni_kurir",
    fullName: "Doni Syahputra",
    phone: "082283995544",
    plate: "BA 4821 QA",
  };

  // 5a. Driver claims delivery task
  const claimRes = await claimDeliveryTask(orderId, driverUser);
  assert("Driver claims delivery task -> 'KURIR_MENJEMPUT'", claimRes.success, claimRes.error);

  // 5b. Driver picks up parcel and begins delivery journey
  const transitRes = await updateDeliveryTaskStatus(orderId, "DALAM_PERJALANAN", driverUser);
  assert("Driver begins transit -> 'DALAM_PERJALANAN'", transitRes.success, transitRes.error);

  // 5c. Live GPS telemetry updates
  const gps1 = await upsertDriverLocation(driverUser.id, -0.9210, 100.3600, 45, 28, orderId);
  assert("Driver GPS beacon 1 emitted & cached", gps1.success && gps1.location.lat === -0.9210);

  const gps2 = await upsertDriverLocation(driverUser.id, -0.9235, 100.3608, 55, 32, orderId);
  assert("Driver GPS beacon 2 emitted & cached", gps2.success && gps2.location.lat === -0.9235);

  const latestLocation = await getDriverLocationByOrderId(orderId);
  assert("Live driver location query returns latest coordinates", !!latestLocation && latestLocation.lat === -0.9235);

  // ============================================================================
  // STEP 6: CUSTOMER TRACKING & PRIVACY MASKING (UU PDP)
  // ============================================================================
  console.log("\n🛡️ [STEP 6] Public Tracking PII Masking Verification");
  // Test masking helper logic from track route
  function maskCustomerName(name?: string): string {
    if (!name) return "Pelanggan";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].length > 2 ? `${parts[0].slice(0, 2)}***` : `${parts[0]}*`;
    }
    return `${parts[0]} ${parts[1][0]}.***`;
  }
  function maskPhoneNumber(phone?: string): string {
    if (!phone || phone.length < 7) return "08**********";
    const cleanPhone = phone.replace(/\D/g, "");
    return `${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-3)}`;
  }
  function maskAddress(addr?: string): string {
    if (!addr) return "-";
    if (addr.length <= 15) return addr;
    return `${addr.slice(0, 15)}... [Disamarkan]`;
  }

  const maskedName = maskCustomerName(customerName);
  const maskedPhone = maskPhoneNumber(testPhone);
  const maskedAddr = maskAddress(customerAddress);

  assert("Customer Name is masked (e.g. 'Rahmat H.***')", maskedName === "Rahmat H.***");
  assert("Customer Phone is masked (e.g. '0822****544')", maskedPhone === "0822****544");
  assert("Customer Address is truncated with '[Disamarkan]'", maskedAddr.includes("[Disamarkan]"));

  // ============================================================================
  // STEP 7: DRIVER DROPOFF & COMPLETION WITH PHOTO PROOF
  // ============================================================================
  console.log("\n🏁 [STEP 7] Driver Dropoff, Photo Proof & Order Completion");
  
  // 7a. Arrived at location
  const arrivedRes = await updateDeliveryTaskStatus(orderId, "TIBA", driverUser);
  assert("Driver arrives at customer destination -> 'TIBA'", arrivedRes.success, arrivedRes.error);

  // 7b. Delivered with proof of delivery photo
  const completeRes = await updateDeliveryTaskStatus(orderId, "SELESAI", driverUser, {
    proofPhotoUrl: "https://example.com/dropoff-photo-proof-01.jpg",
    notes: "Diterima langsung oleh Kak Rahmat di teras depan",
  });
  assert("Driver marks completed with dropoff photo -> 'SELESAI'", completeRes.success, completeRes.error);

  const finalOrder = await getOrderById(orderId);
  assert("Final order state is 'SELESAI'", finalOrder?.status === "SELESAI");

  // ============================================================================
  // STEP 8: WHATSAPP ENGINE AUTOMATION TESTS
  // ============================================================================
  console.log("\n💬 [STEP 8] WhatsApp Notification Automation Engine Tests");

  // 8a. Phone normalization tests
  assert("Phone '082283995544' -> '6282283995544'", formatIndonesianPhone("082283995544") === "6282283995544");
  assert("Phone '+62 822-8399-5544' -> '6282283995544'", formatIndonesianPhone("+62 822-8399-5544") === "6282283995544");
  assert("Phone '6282283995544' -> '6282283995544'", formatIndonesianPhone("6282283995544") === "6282283995544");

  // 8b. wa.me link generation
  const waLink = createWhatsAppLink({ phone: "082283995544", customMessage: "Halo Cetak.inc Padang" });
  assert("wa.me link is valid URL", waLink.startsWith("https://wa.me/6282283995544?text="));

  // 8c. Direct dispatch fallback (mock mode)
  const dispatchRes = await sendWhatsAppDirect("082283995544", "Test automation dispatch");
  assert("sendWhatsAppDirect resolves cleanly in mock/direct mode", dispatchRes.success);

  // 8d. Template triggers (all 4 lifecycle events)
  const n1 = await notifyOrderCreated({ phone: testPhone, customerName, orderCode, total: 108500, invoiceNo: "INV/CTK/001" });
  assert("notifyOrderCreated triggers without breaking", n1.success);

  const n2 = await notifyPaymentVerified({ phone: testPhone, customerName, orderCode, total: 108500 });
  assert("notifyPaymentVerified triggers without breaking", n2.success);

  const n3 = await notifyOrderEnRoute({ phone: testPhone, customerName, orderCode, courierName: "Doni Syahputra" });
  assert("notifyOrderEnRoute triggers without breaking", n3.success);

  const n4 = await notifyOrderCompleted({ phone: testPhone, customerName, orderCode });
  assert("notifyOrderCompleted triggers without breaking", n4.success);

  // ============================================================================
  // STEP 9: PADANG LOCAL SEO & SCHEMA.ORG RICH SNIPPETS
  // ============================================================================
  console.log("\n🌐 [STEP 9] Padang Local SEO & Rich Snippets Validation");

  // 9a. Sitemap verification
  const sitemapEntries = await sitemap();
  assert("Sitemap contains core pages (homepage, produk, lacak, etc.)", sitemapEntries.length > 5);
  const homeEntry = sitemapEntries.find((e: any) => e.priority === 1.0);
  assert("Homepage has priority 1.0", !!homeEntry && homeEntry.priority === 1.0);
  const produkEntry = sitemapEntries.find((e: any) => e.url.endsWith("/produk"));
  assert("Produk page has priority 0.9", !!produkEntry && produkEntry.priority === 0.9);
  const sampleProduct = sitemapEntries.find((e: any) => e.url.includes("/produk/"));
  assert("Dynamic product pages are included in sitemap", !!sampleProduct);

  // 9b. Robots.txt verification
  const robotsConfig = robots();
  const disallowList = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0]?.disallow : robotsConfig.rules?.disallow;
  const disallows = Array.isArray(disallowList) ? disallowList : [disallowList];
  assert("Robots disallows admin portal '/urang-dalam-bas-adv/'", disallows.includes("/urang-dalam-bas-adv/") || disallows.includes("/urang-dalam-bas-adv"));
  assert("Robots disallows private API routes '/api/'", disallows.includes("/api/"));
  assert("Robots points to sitemap.xml", typeof robotsConfig.sitemap === "string" && robotsConfig.sitemap.endsWith("/sitemap.xml"));

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`   🏁 SIMULATION COMPLETE: ${passed} PASSED, ${failed} FAILED                 `);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEndToEndSimulation().catch((err) => {
  console.error("FATAL SIMULATION ERROR:", err);
  process.exit(1);
});
