import { db } from "../client";

export interface PageRecord {
  slug: string;
  title: string;
  content: any;
  updatedAt: string;
}

export function getPage(slug: string): PageRecord | null {
  const r = db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as any;
  if (!r) return null;
  let content = r.content;
  try {
    content = JSON.parse(r.content);
  } catch {
    content = r.content;
  }
  return {
    slug: r.slug,
    title: r.title,
    content,
    updatedAt: r.updated_at,
  };
}

export function setPage(slug: string, title: string, content: any): PageRecord {
  const now = new Date().toISOString();
  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  db.prepare(`
    INSERT INTO pages (slug, title, content, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET title = excluded.title, content = excluded.content, updated_at = excluded.updated_at
  `).run(slug, title, contentStr, now);

  return getPage(slug)!;
}
