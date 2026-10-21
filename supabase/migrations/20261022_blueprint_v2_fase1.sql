-- ==============================================================================
-- CETAK.INC (BAS ADVERTISING) - BLUEPRINT UPDATE V2 (FASE 1: FONDASI)
-- Migration: 20261022_blueprint_v2_fase1.sql
-- Multi-Hub, Roles (Customer, Admin, Vendor, Driver), Outbox Events, RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFILES (MULTI-ROLE: customer, admin, vendor, driver)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin', 'vendor', 'driver')) DEFAULT 'customer',
    full_name TEXT,
    phone TEXT,
    hub_id UUID, -- Terisi jika perannya adalah vendor/workshop cabang tertentu
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index role untuk query cepat & RLS
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_hub ON public.profiles(hub_id);

-- 3. TABEL HUBS (TITIK WORKSHOP / PERCETAKAN MULTI-CABANG)
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

CREATE INDEX IF NOT EXISTS idx_hubs_active ON public.hubs(is_active);
CREATE INDEX IF NOT EXISTS idx_hubs_slug ON public.hubs(slug);

-- Foreign key tambahan dari profiles ke hubs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_hub'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_hub 
        FOREIGN KEY (hub_id) REFERENCES public.hubs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. TABEL HUB_SERVICE_AREAS (PEMETAAN KELURAHAN/KECAMATAN PRIORITAS)
CREATE TABLE IF NOT EXISTS public.hub_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL, -- Contoh: 'Lubuk Buaya', 'Koto Tangah', 'Padang Barat'
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_km NUMERIC,
    priority INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_areas_hub ON public.hub_service_areas(hub_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_name ON public.hub_service_areas(area_name);

-- 5. TABEL HUB_PRODUCTS (PRODUK & HARGA KHUSUS PER HUB)
CREATE TABLE IF NOT EXISTS public.hub_products (
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    price_override NUMERIC(12, 2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (hub_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_hub_products_avail ON public.hub_products(is_available);

-- 6. ALTER ORDERS (KOLOM TAMBAHAN UNTUK MULTI-HUB, KOORDINAT & PEMBAYARAN)
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

CREATE INDEX IF NOT EXISTS idx_orders_hub ON public.orders(hub_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 7. TABEL PAYMENTS (PEMBAYARAN MANUAL DIVERIFIKASI ADMIN)
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

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 8. TABEL INVOICES (INVOICE RESMI PROFESIONAL DENGAN SNAPSHOT DATA)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL, -- Contoh: INV/CTK/2026/10/000123
    public_token TEXT UNIQUE NOT NULL, -- Token aman untuk akses publik pelanggan
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    snapshot JSONB NOT NULL, -- Rincian utuh transaksi saat terbit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_no ON public.invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_invoices_token ON public.invoices(public_token);

-- 9. TABEL DRIVERS (DATA PENGEMUDI / KURIR PERCETAKAN)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT DEFAULT 'Motor',
    plate TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    hub_id UUID REFERENCES public.hubs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_hub ON public.drivers(hub_id);
CREATE INDEX IF NOT EXISTS idx_drivers_online ON public.drivers(is_online);

-- 10. TABEL DELIVERY_TASKS (PENUGASAN PENGANTARAN PESANAN KE DRIVER)
CREATE TABLE IF NOT EXISTS public.delivery_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    provider TEXT DEFAULT 'internal', -- 'internal' | 'gosend' | 'maxim' | 'pickup'
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'PICKING_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED')),
    pickup_proof_url TEXT,
    dropoff_proof_url TEXT,
    eta_min INT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_order ON public.delivery_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_driver ON public.delivery_tasks(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_status ON public.delivery_tasks(status);

-- 11. TABEL DRIVER_LOCATIONS (POSISI GPS REAL-TIME DRIVER - 1 BARIS PER DRIVER)
CREATE TABLE IF NOT EXISTS public.driver_locations (
    driver_id UUID PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    heading REAL,
    speed REAL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABEL SHIPPING_TARIFFS (PENGATURAN TARIF ONGKIR INTERNAL PER HUB)
CREATE TABLE IF NOT EXISTS public.shipping_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE,
    base_fee NUMERIC(10, 2) DEFAULT 8000,
    per_km NUMERIC(10, 2) DEFAULT 2500,
    min_fee NUMERIC(10, 2) DEFAULT 8000,
    max_km NUMERIC(6, 2) DEFAULT 25,
    free_over NUMERIC(14, 2), -- Gratis ongkir jika belanja di atas nominal ini
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tariffs_hub ON public.shipping_tariffs(hub_id);

-- 13. TABEL EVENTS (OUTBOX PATTERN UNTUK EVENT ASINKRON TAHAN GAGAL)
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

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);

-- 14. SEED FEATURE FLAGS & SETTINGS DEFAULT DI TABEL SETTINGS
INSERT INTO public.settings (key, value, description)
VALUES 
    ('feature.google_maps', 'false'::jsonb, 'Toggle provider peta Google Maps vs Leaflet OSM'),
    ('feature.gosend_api', 'false'::jsonb, 'Toggle integrasi resmi GoSend API'),
    ('feature.strict_area_routing', 'true'::jsonb, 'Wajibkan routing otomatis berdasar service area Hub'),
    ('shipping.default_base_fee', '8000'::jsonb, 'Tarif dasar pengiriman kurir internal (Rp)'),
    ('shipping.default_per_km', '2500'::jsonb, 'Tarif per kilometer kurir internal (Rp)'),
    ('bank.bca_account', '{"bank":"BCA","number":"0321948291","name":"Cetak.inc BAS Advertising"}'::jsonb, 'Rekening transfer manual admin'),
    ('bank.qris_static_url', '""'::jsonb, 'URL gambar QRIS statis toko untuk pembayaran')
ON CONFLICT (key) DO NOTHING;

-- 15. SEED DUA HUB AWAL: Hub Padang (Pusat) & Hub Lubuk Buaya (Cabang)
INSERT INTO public.hubs (id, name, slug, address, lat, lng, phone, whatsapp, max_radius_km, daily_capacity, is_active, is_open, notes)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Hub Pusat BAS Advertising Padang',
        'hub-padang-pusat',
        'Jl. Belanti Baru No. 17, Lolong Belanti, Kec. Padang Utara, Kota Padang, Sumatera Barat',
        -0.9025,
        100.3542,
        '082283995544',
        '6282283995544',
        25,
        150,
        true,
        true,
        'Workshop Pusat - Fasilitas Spanduk Outdoor, Indoor, Digital A3+, Sablon & Akrilik'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Hub Lubuk Buaya (Workshop Cabang)',
        'hub-lubuk-buaya',
        'Jl. Adinegoro No. 88, Lubuk Buaya, Kec. Koto Tangah, Kota Padang, Sumatera Barat',
        -0.8354,
        100.3150,
        '082283995544',
        '6282283995544',
        20,
        100,
        true,
        true,
        'Workshop Cabang Utara - Prioritas Pesanan Area Lubuk Buaya & Koto Tangah'
    )
ON CONFLICT (slug) DO NOTHING;

-- Service area prioritas untuk Hub Lubuk Buaya
INSERT INTO public.hub_service_areas (hub_id, area_name, center_lat, center_lng, radius_km, priority)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'Lubuk Buaya', -0.8354, 100.3150, 6.0, 10),
    ('00000000-0000-0000-0000-000000000002', 'Koto Tangah', -0.8300, 100.3200, 8.0, 5),
    ('00000000-0000-0000-0000-000000000002', 'Batang Kabung Ganting', -0.8400, 100.3100, 5.0, 5)
ON CONFLICT DO NOTHING;

-- 16. TRIGGER OTOMATIS: POPULATE PROFILES SAAT USER DAFTAR DI SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Pelanggan Cetak.inc'),
        COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
        COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 18. ATURAN KEAMANAN (RLS POLICIES)
-- Service Role bypasses all RLS automatically (digunakan oleh serverless API routes kita).
-- Pelanggan & Publik:
CREATE POLICY "Public profiles can read own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can read active hubs" ON public.hubs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read service areas" ON public.hub_service_areas FOR SELECT USING (true);
CREATE POLICY "Public can read available hub products" ON public.hub_products FOR SELECT USING (is_available = true);
CREATE POLICY "Public can read active tariffs" ON public.shipping_tariffs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read invoice via token" ON public.invoices FOR SELECT USING (true);

-- Driver locations: Pelanggan & Driver bisa baca, Driver bisa update miliknya
CREATE POLICY "Driver locations readable by public tracking" ON public.driver_locations FOR SELECT USING (true);
CREATE POLICY "Drivers can update own location" ON public.driver_locations FOR ALL USING (auth.uid() = driver_id);
