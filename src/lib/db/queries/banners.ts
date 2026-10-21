import { supabaseAdmin } from "@/lib/supabase/admin";
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

export async function getBanners(includeInactive = false): Promise<BannerRecord[]> {
  try {
    let query = supabaseAdmin
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error("[SUPABASE] Gagal mengambil banner:", error?.message);
      return [];
    }

    return data.map((r: any) => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      imageUrl: r.image_url,
      ctaLabel: r.cta_label,
      ctaHref: r.cta_href,
      sortOrder: Number(r.sort_order) || 0,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
    }));
  } catch (err: any) {
    console.error("[SUPABASE_ERR] Error getBanners:", err);
    return [];
  }
}

export async function getBannerById(id: string): Promise<BannerRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("banners")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.image_url,
      ctaLabel: data.cta_label,
      ctaHref: data.cta_href,
      sortOrder: Number(data.sort_order) || 0,
      isActive: Boolean(data.is_active),
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function createBanner(input: BannerInput): Promise<BannerRecord> {
  const id = input.id || "ban-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const payload = {
    id,
    title: input.title,
    subtitle: input.subtitle || null,
    image_url: input.imageUrl,
    cta_label: input.ctaLabel || "Pesan Sekarang",
    cta_href: input.ctaHref || "/produk",
    sort_order: input.sortOrder || 0,
    is_active: input.isActive !== undefined ? Boolean(input.isActive) : true,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin
    .from("banners")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Gagal membuat banner di Supabase");
  }

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    imageUrl: data.image_url,
    ctaLabel: data.cta_label,
    ctaHref: data.cta_href,
    sortOrder: Number(data.sort_order) || 0,
    isActive: Boolean(data.is_active),
    createdAt: data.created_at,
  };
}

export async function updateBanner(
  id: string,
  input: Partial<BannerInput>
): Promise<BannerRecord | null> {
  const existing = await getBannerById(id);
  if (!existing) return null;

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.subtitle !== undefined) updates.subtitle = input.subtitle;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
  if (input.ctaLabel !== undefined) updates.cta_label = input.ctaLabel;
  if (input.ctaHref !== undefined) updates.cta_href = input.ctaHref;
  if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;
  if (input.isActive !== undefined) updates.is_active = Boolean(input.isActive);

  const { data, error } = await supabaseAdmin
    .from("banners")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Gagal memperbarui banner di Supabase");
  }

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    imageUrl: data.image_url,
    ctaLabel: data.cta_label,
    ctaHref: data.cta_href,
    sortOrder: Number(data.sort_order) || 0,
    isActive: Boolean(data.is_active),
    createdAt: data.created_at,
  };
}

export async function deleteBanner(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("banners").delete().eq("id", id);
  return !error;
}
