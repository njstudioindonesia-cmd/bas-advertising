import { supabaseAdmin } from "../src/lib/supabase/admin";
import { getProducts } from "../src/lib/db/queries/products";
import { getCategories } from "../src/lib/db/queries/categories";
import { getBanners } from "../src/lib/db/queries/banners";
import { getSettings } from "../src/lib/db/queries/settings";

async function runMigration() {
  console.log("🚀 Memulai migrasi data dari SQLite lokal ke Supabase PostgreSQL...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL belum diatur di .env.local!");
    process.exit(1);
  }

  try {
    // 1. Migrasi Kategori
    console.log("📦 1. Memigrasikan Kategori...");
    const categories = await getCategories(true);
    for (const c of categories) {
      const { error } = await supabaseAdmin.from("categories").upsert({
        id: c.id,
        slug: c.slug,
        name: c.name,
        icon: c.icon || "Package",
        sort_order: c.sortOrder || 0,
        is_active: c.isActive,
      });
      if (error) console.error(`  ⚠️ Gagal kategori ${c.name}:`, error.message);
      else console.log(`  ✅ Kategori '${c.name}' berhasil`);
    }

    // 2. Migrasi Produk
    console.log("\n🛍️ 2. Memigrasikan Produk...");
    const { products } = await getProducts({ includeInactive: true });
    for (const p of products) {
      const { error } = await supabaseAdmin.from("products").upsert({
        id: p.id,
        slug: p.slug,
        category_id: p.categoryId,
        name: p.name,
        description: p.description || "",
        price: p.priceNumber || 0,
        compare_at_price: p.compareAtPrice || null,
        unit: p.unit || "/ pcs",
        image_url: p.imageUrl || p.img,
        gallery: p.gallery || [],
        specs: p.specs || [],
        is_best_seller: Boolean(p.isBestSeller),
        is_active: Boolean(p.isActive),
        rating: p.rating || "5.0",
        sold: p.sold || "0",
        sort_order: p.sortOrder || 0,
      });
      if (error) console.error(`  ⚠️ Gagal produk ${p.name}:`, error.message);
      else console.log(`  ✅ Produk '${p.name}' berhasil`);
    }

    // 3. Migrasi Banners
    console.log("\n🖼️ 3. Memigrasikan Banner Promo...");
    const banners = await getBanners(true);
    for (const b of banners) {
      const { error } = await supabaseAdmin.from("banners").upsert({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || null,
        image_url: b.imageUrl,
        cta_label: b.ctaLabel || "Pesan Sekarang",
        cta_href: b.ctaHref || "/produk",
        sort_order: b.sortOrder || 0,
        is_active: b.isActive,
      });
      if (error) console.error(`  ⚠️ Gagal banner ${b.title}:`, error.message);
      else console.log(`  ✅ Banner '${b.title}' berhasil`);
    }

    // 4. Migrasi Settings
    console.log("\n⚙️ 4. Memigrasikan Pengaturan & Kontak...");
    const settings = await getSettings();
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabaseAdmin.from("settings").upsert({
        key,
        value: value as any,
      });
      if (error) console.error(`  ⚠️ Gagal setting ${key}:`, error.message);
      else console.log(`  ✅ Setting '${key}' berhasil`);
    }

    console.log("\n🎉 SELURUH DATA LOKAL BERHASIL DIMIGRASIKAN KE SUPABASE DENGAN SEMPURNA!");
  } catch (err: any) {
    console.error("❌ Terjadi kesalahan fatal saat migrasi:", err);
  }
}

runMigration();
