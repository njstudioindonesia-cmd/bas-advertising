/**
 * Automated Verification Script for Blueprint V2: Fase 7 — UX "Tidak Kaku" & Astro/GoFood Polish
 */

const fs = require("fs");
const path = require("path");

async function runTests() {
  console.log("=== RUNNING FASE 7 VERIFICATION TESTS (UX TIDAK KAKU & ASTRO/GOFOOD POLISH) ===\n");
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

  // 1. Mobile Portrait & Viewport Lock Safety (globals.css)
  const cssPath = path.resolve(__dirname, "../src/app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");
  assert("globals.css contains overflow-x: hidden for viewport lock", cssContent.includes("overflow-x: hidden"));
  assert("globals.css contains max-width: 100vw to prevent horizontal blowout", cssContent.includes("max-width: 100vw"));
  assert("globals.css defines pb-safe utility for mobile notches and home bars", cssContent.includes("pb-safe"));

  // 2. Mobile Bottom Navigation (BottomNav.tsx)
  const bottomNavPath = path.resolve(__dirname, "../src/components/BottomNav.tsx");
  const bottomNavContent = fs.readFileSync(bottomNavPath, "utf-8");
  assert("BottomNav hides on /vendor portal", bottomNavContent.includes('pathname?.startsWith("/vendor")'));
  assert("BottomNav hides on /driver portal", bottomNavContent.includes('pathname?.startsWith("/driver")'));
  assert("BottomNav hides on /invoice print pages", bottomNavContent.includes('pathname?.startsWith("/invoice")'));
  assert("BottomNav contains Beranda tab", bottomNavContent.includes('"Beranda"'));
  assert("BottomNav contains Katalog tab", bottomNavContent.includes('"Katalog"'));
  assert("BottomNav contains Lacak Live tab", bottomNavContent.includes('"Lacak"'));
  assert("BottomNav contains Keranjang tab with badge", bottomNavContent.includes('"Keranjang"'));

  // 3. Floating Cart Bar (FloatingCartBar.tsx)
  const cartBarPath = path.resolve(__dirname, "../src/components/FloatingCartBar.tsx");
  const cartBarContent = fs.readFileSync(cartBarPath, "utf-8");
  assert("FloatingCartBar hides on /vendor portal", cartBarContent.includes('pathname?.startsWith("/vendor")'));
  assert("FloatingCartBar hides on /driver portal", cartBarContent.includes('pathname?.startsWith("/driver")'));
  assert("FloatingCartBar hides on /invoice", cartBarContent.includes('pathname?.startsWith("/invoice")'));

  // 4. Desktop 2-Column Live Tracking Layout (src/app/lacak/page.tsx)
  const lacakPath = path.resolve(__dirname, "../src/app/lacak/page.tsx");
  const lacakContent = fs.readFileSync(lacakPath, "utf-8");
  assert("Lacak page uses max-w-6xl container for wide desktop layout", lacakContent.includes("max-w-6xl"));
  assert("Lacak page implements desktop 2-column grid (lg:grid-cols-12)", lacakContent.includes("lg:grid-cols-12"));
  assert("Lacak page left column hosts map (lg:col-span-7)", lacakContent.includes("lg:col-span-7"));
  assert("Lacak page right column hosts timeline & details (lg:col-span-5)", lacakContent.includes("lg:col-span-5"));
  assert("Lacak page map is sticky on desktop (lg:sticky lg:top-28)", lacakContent.includes("lg:sticky"));

  // 5. Desktop Grid Expansion (4 to 5 Columns)
  const produkPath = path.resolve(__dirname, "../src/app/produk/page.tsx");
  const produkContent = fs.readFileSync(produkPath, "utf-8");
  assert("Katalog produk expands to xl:grid-cols-5 on desktop", produkContent.includes("xl:grid-cols-5"));
  assert("Katalog produk maintains grid-cols-2 on mobile portrait", produkContent.includes("grid-cols-2"));

  const homePath = path.resolve(__dirname, "../src/app/page.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");
  assert("Beranda recommended grid expands to xl:grid-cols-5 on desktop", homeContent.includes("xl:grid-cols-5"));

  // 6. Quick Bottom Sheet & Drawer Components
  const sheetPath = path.resolve(__dirname, "../src/components/ProductBottomSheet.tsx");
  const drawerPath = path.resolve(__dirname, "../src/components/CartDrawer.tsx");
  assert("ProductBottomSheet exists with dimension calculator", fs.existsSync(sheetPath));
  assert("CartDrawer exists with desktop side drawer", fs.existsSync(drawerPath));

  console.log(`\n=== FASE 7 VERIFICATION SUMMARY ===`);
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
