-- Create tables for medical wholesale app
-- Run this in Supabase SQL Editor

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 99,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
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

-- Store settings table
CREATE TABLE store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT,
  whatsapp_number TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_status ON categories(status);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (adjust as needed)
CREATE POLICY "Public read access on categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access on products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public read access on store_settings" ON store_settings
  FOR SELECT USING (true);
