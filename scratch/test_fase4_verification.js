/**
 * Automated Verification Script for Blueprint V2: Fase 4 — Pembayaran via Admin & Invoice
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

const QRCode = require("qrcode");
const {
  DEFAULT_PAYMENT_ACCOUNTS,
  generateUniqueCode,
  submitPaymentProof,
  getPayments,
  verifyPayment,
  rejectPayment,
} = require("../src/modules/payments/service");
const {
  generateInvoiceNumber,
  generatePublicToken,
  createOrGetInvoice,
  getInvoiceByNo,
  getInvoiceByOrderId,
  markInvoicePaid,
} = require("../src/modules/invoices/generator");

async function runTests() {
  console.log("=== RUNNING FASE 4 VERIFICATION TESTS ===\n");
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

  // 1. Unique 3-digit Code Test
  const code = generateUniqueCode();
  assert("Unique code is a 3-digit integer (100 - 999)", code >= 100 && code <= 999);

  // 2. Default Payment Accounts Test
  assert("Default payment accounts includes Bank Nagari (Sumbar)", DEFAULT_PAYMENT_ACCOUNTS.some(a => a.id === "nagari" && a.bank.includes("Nagari")));
  assert("Default payment accounts includes QRIS Cetak.inc", DEFAULT_PAYMENT_ACCOUNTS.some(a => a.id === "qris"));
  assert("Total manual payment options >= 4 banks + QRIS", DEFAULT_PAYMENT_ACCOUNTS.length >= 4);

  // 3. Invoice Number & Token Generator Test
  const invNo = generateInvoiceNumber();
  assert("Invoice number follows INV/CTK/YYYY/MM/XXXXXX format", /^INV\/CTK\/\d{4}\/\d{2}\/\d{6}$/.test(invNo));
  const pToken = generatePublicToken();
  assert("Public token is 32-character hex string", pToken.length === 32);

  // 4. Create and Get Invoice Snapshot
  const testOrderId = "test-ord-" + Date.now();
  const testOrderCode = "BAS-20261022-9999";
  const invoice = await createOrGetInvoice(testOrderId, {
    invoiceNo: invNo,
    orderCode: testOrderCode,
    customerName: "Rian Pratama",
    customerPhone: "081267891234",
    deliveryMethod: "Kurir Workshop",
    deliveryAddress: "Jl. Khatib Sulaiman No. 42 Padang",
    hubName: "Hub Pusat BAS Advertising Padang",
    items: [
      { name: "Spanduk Flexi 280gr", qty: 2, unitPrice: 45000, subtotal: 90000, specs: "Finishing Mata Ayam 4 Sudut" }
    ],
    subtotal: 90000,
    deliveryFee: 10000,
    uniqueCode: code,
    total: 90000 + 10000 + code,
    paymentStatus: "BELUM_DIBAYAR",
    issuedAt: new Date().toISOString(),
  });
  assert("Invoice snapshot created with BELUM_DIBAYAR status", invoice.snapshot.paymentStatus === "BELUM_DIBAYAR");
  assert("Invoice total includes subtotal + deliveryFee + uniqueCode", invoice.snapshot.total === (100000 + code));

  // 5. Retrieve Invoice by Invoice Number
  const retrievedInv = await getInvoiceByNo(invoice.invoiceNo);
  assert("Invoice retrievable by invoice number", retrievedInv && retrievedInv.invoiceNo === invoice.invoiceNo);

  // 6. Submit Payment Proof
  const proofResult = await submitPaymentProof({
    orderId: testOrderId,
    orderCode: testOrderCode,
    customerName: "Rian Pratama",
    customerPhone: "081267891234",
    amount: 100000 + code,
    proofUrl: "https://example.com/mock-receipt.jpg",
    senderBank: "Bank Nagari",
    senderName: "Rian Pratama",
    notes: "Sudah ditransfer pas sampai kode unik",
  });
  assert("Payment proof submitted successfully with paymentId", proofResult.success && Boolean(proofResult.paymentId));

  // 7. List Payments
  const payments = await getPayments();
  const testPayment = payments.find(p => p.orderId === testOrderId);
  assert("Submitted payment appears in pending payments list", testPayment && testPayment.status === "PENDING");

  // 8. Verify Payment (Admin Approval)
  if (testPayment) {
    const verifyRes = await verifyPayment(testPayment.id, testOrderId, {
      id: "admin-test",
      username: "admin_test",
    });
    assert("Admin verifyPayment succeeds", verifyRes.success === true);

    const updatedInv = await getInvoiceByOrderId(testOrderId);
    assert("Invoice paymentStatus changes to LUNAS upon admin verification", updatedInv && updatedInv.snapshot.paymentStatus === "LUNAS");
    assert("Invoice paidAt timestamp is recorded", Boolean(updatedInv && updatedInv.paidAt));
  }

  // 9. Reject Payment Flow Test
  const testRejectOrderId = "test-ord-reject-" + Date.now();
  const rejectProof = await submitPaymentProof({
    orderId: testRejectOrderId,
    orderCode: "BAS-20261022-8888",
    customerName: "Customer Tolak",
    amount: 50000,
    proofUrl: "https://example.com/bad-receipt.jpg",
  });
  if (rejectProof.paymentId) {
    const rejectRes = await rejectPayment(
      rejectProof.paymentId,
      testRejectOrderId,
      "Nominal transfer kurang Rp 20.000",
      { id: "admin-test", username: "admin_test" }
    );
    assert("Admin rejectPayment records reason and returns success", rejectRes.success === true);
  }

  // 10. QR Code Generation Test
  const qrDataUrl = await QRCode.toDataURL(`https://cetak.inc/invoice/${encodeURIComponent(invNo)}`);
  assert("QR Code data URL generates valid PNG image string", qrDataUrl.startsWith("data:image/png;base64,"));

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
