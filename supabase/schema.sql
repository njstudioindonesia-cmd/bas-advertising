-- ==============================================================================
-- CETAK.INC (BAS ADVERTISING) - FULL PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Eksekusi seluruh skrip ini di menu SQL Editor pada Dashboard Supabase Anda
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL KATEGORI PRODUK
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Package',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PRODUK
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    compare_at_price NUMERIC(12, 2),
    unit TEXT DEFAULT '/ pcs',
    image_url TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '[]'::jsonb,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    rating TEXT DEFAULT '5.0',
    sold TEXT DEFAULT '0',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL BANNER PROMO & FLASH SALE
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_label TEXT DEFAULT 'Pesan Sekarang',
    cta_href TEXT DEFAULT '/produk',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PESANAN (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    address TEXT,
    payment_method TEXT NOT NULL,
    note TEXT,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'BARU',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL ITEM PESANAN (ORDER ITEMS)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price NUMERIC(12, 2) NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL,
    design_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL PENGATURAN GLOBAL (SETTINGS)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL PORTOFOLIO PROYEK
CREATE TABLE IF NOT EXISTS public.portfolio (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    client TEXT,
    category TEXT,
    image_url TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL PESAN MASUK (INQUIRIES DARI FORM KONTAK)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'BELUM_DIBACA',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABEL AKUN ADMIN URANG DALAM
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABEL AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    diff JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX OPTIMASI KECEPATAN QUERY
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON public.banners(sort_order);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES: PUBLIC READ ACCESS FOR ACTIVE CATALOG ITEMS
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view active portfolio" ON public.portfolio;
CREATE POLICY "Public can view active portfolio" ON public.portfolio FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings" ON public.settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
CREATE POLICY "Public can insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (TRUE);

-- POLICIES: SERVICE ROLE (ADMIN API) FULL ACCESS
DROP POLICY IF EXISTS "Service role full access categories" ON public.categories;
CREATE POLICY "Service role full access categories" ON public.categories FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access products" ON public.products;
CREATE POLICY "Service role full access products" ON public.products FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access banners" ON public.banners;
CREATE POLICY "Service role full access banners" ON public.banners FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;
CREATE POLICY "Service role full access order_items" ON public.order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access settings" ON public.settings;
CREATE POLICY "Service role full access settings" ON public.settings FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access portfolio" ON public.portfolio;
CREATE POLICY "Service role full access portfolio" ON public.portfolio FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access inquiries" ON public.inquiries;
CREATE POLICY "Service role full access inquiries" ON public.inquiries FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access admin_users" ON public.admin_users;
CREATE POLICY "Service role full access admin_users" ON public.admin_users FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role full access audit_logs" ON public.audit_logs;
CREATE POLICY "Service role full access audit_logs" ON public.audit_logs FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- ==============================================================================
-- CETAK.INC (BAS ADVERTISING) - BLUEPRINT V2 (MULTI-HUB, ROLES & LOGISTICS EXTENSION)
-- ==============================================================================

-- 12. TABEL PROFILES (MULTI-ROLE: customer, admin, vendor, driver)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin', 'vendor', 'driver')) DEFAULT 'customer',
    full_name TEXT,
    phone TEXT,
    hub_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TABEL HUBS (TITIK WORKSHOP / PERCETAKAN MULTI-CABANG)
CREATE TABLE IF NOT EXISTS public.hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    max_radius_km NUMERIC DEFAULT 15,
    daily_capacity INT DEFAULT 50,
    opening_hours JSONB DEFAULT '{"mon":["08:00","17:00"],"tue":["08:00","17:00"],"wed":["08:00","17:00"],"thu":["08:00","17:00"],"fri":["08:00","17:00"],"sat":["08:00","15:00"],"sun":[]}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_open BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABEL HUB_SERVICE_AREAS
CREATE TABLE IF NOT EXISTS public.hub_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_km NUMERIC,
    priority INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TABEL HUB_PRODUCTS
CREATE TABLE IF NOT EXISTS public.hub_products (
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    price_override NUMERIC(12, 2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (hub_id, product_id)
);

-- 16. EXTENSION ORDERS COLUMNS
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS hub_id UUID REFERENCES public.hubs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS dest_lat DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS dest_lng DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS dest_address TEXT,
    ADD COLUMN IF NOT EXISTS dest_note TEXT,
    ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS unique_code INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'UNPAID',
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- 17. TABEL PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    reject_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TABEL INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL,
    public_token TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. TABEL DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT DEFAULT 'Motor',
    plate TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    hub_id UUID REFERENCES public.hubs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. TABEL DELIVERY_TASKS
CREATE TABLE IF NOT EXISTS public.delivery_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    provider TEXT DEFAULT 'internal',
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'PICKING_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED')),
    pickup_proof_url TEXT,
    dropoff_proof_url TEXT,
    eta_min INT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. TABEL DRIVER_LOCATIONS
CREATE TABLE IF NOT EXISTS public.driver_locations (
    driver_id UUID PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    heading REAL,
    speed REAL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. TABEL SHIPPING_TARIFFS
CREATE TABLE IF NOT EXISTS public.shipping_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE,
    base_fee NUMERIC(10, 2) DEFAULT 8000,
    per_km NUMERIC(10, 2) DEFAULT 2500,
    min_fee NUMERIC(10, 2) DEFAULT 8000,
    max_km NUMERIC(6, 2) DEFAULT 25,
    free_over NUMERIC(14, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. TABEL EVENTS (OUTBOX BUS)
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DONE', 'FAILED')),
    attempts INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);
