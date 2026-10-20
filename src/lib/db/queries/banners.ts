import { db } from "../client";
import { BannerInput } from "@/lib/validators";

export interface BannerRecord {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function getBanners(includeInactive = false): BannerRecord[] {
  const query = includeInactive
    ? "SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC"
    : "SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC";

  const rows = db.prepare(query).all() as any[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    imageUrl: r.image_url,
    ctaLabel: r.cta_label,
    ctaHref: r.cta_href,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
  }));
}

export function getBannerById(id: string): BannerRecord | null {
  const r = db.prepare("SELECT * FROM banners WHERE id = ?").get(id) as any;
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    imageUrl: r.image_url,
    ctaLabel: r.cta_label,
    ctaHref: r.cta_href,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
  };
}

export function createBanner(input: BannerInput): BannerRecord {
  const id = input.id || "ban-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO banners (id, title, subtitle, image_url, cta_label, cta_href, sort_order, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.title,
    input.subtitle || null,
    input.imageUrl,
    input.ctaLabel || null,
    input.ctaHref || null,
    input.sortOrder || 0,
    input.isActive !== undefined ? (input.isActive ? 1 : 0) : 1,
    now
  );

  return getBannerById(id)!;
}

export function updateBanner(id: string, input: Partial<BannerInput>): BannerRecord | null {
  const existing = getBannerById(id);
  if (!existing) return null;

  const title = input.title ?? existing.title;
  const subtitle = input.subtitle !== undefined ? input.subtitle : existing.subtitle;
  const imageUrl = input.imageUrl ?? existing.imageUrl;
  const ctaLabel = input.ctaLabel !== undefined ? input.ctaLabel : existing.ctaLabel;
  const ctaHref = input.ctaHref !== undefined ? input.ctaHref : existing.ctaHref;
  const sortOrder = input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder;
  const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);

  db.prepare(`
    UPDATE banners SET
      title = ?, subtitle = ?, image_url = ?, cta_label = ?, cta_href = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `).run(title, subtitle, imageUrl, ctaLabel, ctaHref, sortOrder, isActive, id);

  return getBannerById(id);
}

export function deleteBanner(id: string): boolean {
  db.prepare("DELETE FROM banners WHERE id = ?").run(id);
  return true;
}
