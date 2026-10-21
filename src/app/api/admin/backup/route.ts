import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/db/queries/audit";
import { revalidateEntity } from "@/lib/cache-tags";

function createAutoBackup(reason: string): string {
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${reason}-${timestamp}.json`;
  const filePath = path.join(backupDir, filename);

  const dump = exportFullDatabase();
  fs.writeFileSync(filePath, JSON.stringify(dump, null, 2), "utf-8");
  return filename;
}

function exportFullDatabase() {
  const categories = db.prepare("SELECT * FROM categories").all();
  const products = db.prepare("SELECT * FROM products").all();
  const banners = db.prepare("SELECT * FROM banners").all();
  const settings = db.prepare("SELECT * FROM settings").all();
  const portfolio = db.prepare("SELECT * FROM portfolio").all();
  const pages = db.prepare("SELECT * FROM pages").all();

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    system: "Cetak.inc — Printing & Advertising Studio",
    data: {
      categories,
      products,
      banners,
      settings,
      portfolio,
      pages,
    },
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const dump = exportFullDatabase();

    return new NextResponse(JSON.stringify(dump, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bas-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal membuat backup" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response!;

    const body = await request.json();
    const { action, confirmText, importData } = body;

    if (action === "reset") {
      if (confirmText !== "RESET") {
        return NextResponse.json(
          { success: false, error: "Konfirmasi reset tidak valid. Harap ketik 'RESET' dengan huruf besar." },
          { status: 400 }
        );
      }

      // 1. Buat backup otomatis terlebih dahulu
      const backupFile = createAutoBackup("pre-reset");

      // 2. Jalankan seed ulang
      // Hapus data yang dapat diganti
      db.exec("BEGIN TRANSACTION;");
      try {
        db.prepare("DELETE FROM products").run();
        db.prepare("DELETE FROM categories").run();
        db.prepare("DELETE FROM banners").run();
        db.prepare("DELETE FROM portfolio").run();
        db.prepare("DELETE FROM pages").run();
        // Keep settings or reset them
        db.exec("COMMIT;");
      } catch (err) {
        db.exec("ROLLBACK;");
        throw err;
      }

      // Re-run seed
      const seedScriptPath = path.join(process.cwd(), "scripts", "seed.mjs");
      const { execSync } = await import("node:child_process");
      execSync(`node "${seedScriptPath}"`);

      logAudit({
        actor: "admin",
        action: "DATABASE_RESET",
        entity: "database",
        diff: { backupFile },
      });

      revalidateEntity("products");
      revalidateEntity("categories");
      revalidateEntity("banners");
      revalidateEntity("portfolio");
      revalidateEntity("pages");
      revalidateEntity("settings");

      return NextResponse.json({
        success: true,
        message: `Database berhasil direset ke pengaturan awal. Salinan backup otomatis telah disimpan ke ${backupFile}`,
      });
    }

    if (action === "import") {
      if (!importData || !importData.data) {
        return NextResponse.json({ success: false, error: "File data import tidak valid atau rusak." }, { status: 400 });
      }

      // 1. Buat backup otomatis
      const backupFile = createAutoBackup("pre-import");

      const { categories, products, banners, settings, portfolio, pages } = importData.data;

      db.exec("BEGIN TRANSACTION;");
      try {
        if (Array.isArray(categories) && categories.length > 0) {
          db.prepare("DELETE FROM categories").run();
          const stmt = db.prepare(`
            INSERT INTO categories (id, slug, name, icon, sort_order, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const c of categories) {
            stmt.run(c.id, c.slug, c.name, c.icon, c.sort_order, c.is_active, c.created_at, c.updated_at);
          }
        }

        if (Array.isArray(products) && products.length > 0) {
          db.prepare("DELETE FROM products").run();
          const stmt = db.prepare(`
            INSERT INTO products (id, slug, category_id, name, description, price, compare_at_price, unit, image_url, gallery, specs, is_best_seller, is_active, rating, sold, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const p of products) {
            stmt.run(p.id, p.slug, p.category_id, p.name, p.description, p.price, p.compare_at_price, p.unit, p.image_url, p.gallery, p.specs, p.is_best_seller, p.is_active, p.rating, p.sold, p.sort_order, p.created_at, p.updated_at);
          }
        }

        if (Array.isArray(banners) && banners.length > 0) {
          db.prepare("DELETE FROM banners").run();
          const stmt = db.prepare(`
            INSERT INTO banners (id, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const b of banners) {
            stmt.run(b.id, b.title, b.subtitle, b.image_url, b.cta_label, b.cta_href, b.sort_order, b.is_active, b.created_at);
          }
        }

        if (Array.isArray(settings) && settings.length > 0) {
          const stmt = db.prepare(`
            INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
          `);
          for (const s of settings) {
            stmt.run(s.key, s.value, s.updated_at);
          }
        }

        if (Array.isArray(portfolio) && portfolio.length > 0) {
          db.prepare("DELETE FROM portfolio").run();
          const stmt = db.prepare(`
            INSERT INTO portfolio (id, title, client, category, image_url, description, sort_order, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const pt of portfolio) {
            stmt.run(pt.id, pt.title, pt.client, pt.category, pt.image_url, pt.description, pt.sort_order, pt.is_active, pt.created_at);
          }
        }

        if (Array.isArray(pages) && pages.length > 0) {
          const stmt = db.prepare(`
            INSERT INTO pages (slug, title, content, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET title = excluded.title, content = excluded.content, updated_at = excluded.updated_at
          `);
          for (const pg of pages) {
            stmt.run(pg.slug, pg.title, pg.content, pg.updated_at);
          }
        }

        db.exec("COMMIT;");
      } catch (err) {
        db.exec("ROLLBACK;");
        throw err;
      }

      logAudit({
        actor: "admin",
        action: "IMPORT_BACKUP",
        entity: "database",
        diff: { backupFile },
      });

      revalidateEntity("products");
      revalidateEntity("categories");
      revalidateEntity("banners");
      revalidateEntity("portfolio");
      revalidateEntity("pages");
      revalidateEntity("settings");

      return NextResponse.json({
        success: true,
        message: `Data berhasil diimpor dari file backup. Backup sebelumnya tersimpan di ${backupFile}`,
      });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memproses aksi backup" }, { status: 500 });
  }
}
