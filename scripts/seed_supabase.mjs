import { config } from 'dotenv'
import { Client } from 'pg'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim()

if (!supabaseUrl || !dbPassword) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in environment')
  process.exit(1)
}

const projectRef = supabaseUrl.replace(/^https?:\/\//, '').replace(/\.supabase\.co$/, '')
const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`

const client = new Client({ connectionString })

const sql = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 99,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  brand TEXT,
  pack_count TEXT,
  strength TEXT,
  form TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT,
  whatsapp_number TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on categories" ON categories;
DROP POLICY IF EXISTS "Public access on products" ON products;
DROP POLICY IF EXISTS "Public access on store_settings" ON store_settings;

CREATE POLICY "Public access on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO categories (id, name, slug, display_order, status, created_at, updated_at)
VALUES
  ('cat-1', 'Tablets', 'tablets', 1, 'active', NOW(), NOW()),
  ('cat-2', 'Capsules', 'capsules', 2, 'active', NOW(), NOW()),
  ('cat-3', 'Syrups', 'syrups', 3, 'active', NOW(), NOW()),
  ('cat-4', 'Injections', 'injections', 4, 'active', NOW(), NOW()),
  ('cat-5', 'Medical Supplies', 'medical-supplies', 5, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
  id, sku, name, category_id, category_name, brand, pack_count, strength, form, description, image_url, status, created_at, updated_at
)
VALUES
  ('prod-1', 'PCM500-10', 'Paracetamol 500mg — Brand A — 10 Tablets', 'cat-1', 'Tablets', 'ABC Pharma', '10 Tablets', '500mg', 'Tablet', 'High purity analgesics for fever and mild to moderate pain relief.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', 'active', NOW(), NOW()),
  ('prod-2', 'PCM500-20', 'Paracetamol 500mg — Brand A — 20 Tablets', 'cat-1', 'Tablets', 'ABC Pharma', '20 Tablets', '500mg', 'Tablet', 'Hospital & retail bulk pack of 20 tablets per box.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', 'active', NOW(), NOW()),
  ('prod-3', 'PCM500-B10', 'Paracetamol 500mg — Brand B — 10 Tablets', 'cat-1', 'Tablets', 'Apex Laboratories', '10 Tablets', '500mg', 'Tablet', 'Fast-dissolving anti-pyretic formulation by Apex Labs.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80', 'active', NOW(), NOW()),
  ('prod-4', 'AMX250-10', 'Amoxicillin 250mg Capsules', 'cat-2', 'Capsules', 'XYZ Pharma', '10 Capsules', '250mg', 'Capsule', 'Broad spectrum antibiotic capsules for bacterial infections.', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80', 'active', NOW(), NOW()),
  ('prod-5', 'AZI500-3', 'Azithromycin 500mg Tablets', 'cat-1', 'Tablets', 'Novartis Healthcare', '3 Tablets', '500mg', 'Tablet', 'Macrolide antibiotic 3-day course pack for respiratory tract infections.', 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO store_settings (id, business_name, whatsapp_number, contact_phone, logo_url, created_at, updated_at)
VALUES ('default', 'PharmDirect Wholesale', '919876543210', '+91 98765 43210', '', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
`

try {
  await client.connect()
  await client.query(sql)
  console.log('Supabase schema and seed data are ready.')
} catch (error) {
  console.error('Seed failed:', error)
  process.exit(1)
} finally {
  await client.end()
}
