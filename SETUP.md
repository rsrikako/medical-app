# Supabase Setup Checklist

Follow these steps to get your app running on Supabase + Vercel.

## ✅ COMPLETED

- [x] Supabase project created
- [x] Environment variables configured in `.env.local`
- [x] Next.js updated to use Supabase
- [x] Build test passed

## ⏭️ NEXT STEPS

### 1. Set Up Supabase Database (5 minutes)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Click **SQL Editor** → **New Query**
3. Copy this SQL and run it:

```sql
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

-- Indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_status ON categories(status);

-- Enable Row Level Security (optional)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access on store_settings" ON store_settings FOR SELECT USING (true);
```

✓ Should see: "Query run successfully"

### 2. Set Up Supabase Storage (3 minutes)

1. Go to Supabase dashboard → **Storage**
2. Click **Create new bucket**
3. Name: `product-images`
4. Set visibility: **Public**
5. Click **Create bucket**

### 3. Test Locally (2 minutes)

```bash
npm run dev
```

Then visit: http://localhost:3000

Test the admin panel:
- Go to http://localhost:3000/admin
- Create a test category
- Create a test product
- Check if data appears in Supabase SQL Editor

### 4. Deploy to Vercel (5 minutes)

**Option A: GitHub (Recommended)**

```bash
git add .
git commit -m "Migrate to Supabase and deploy to Vercel"
git push
```

Then go to https://vercel.com and:
1. Click **Import Project**
2. Select your GitHub repo
3. Vercel auto-detects Next.js
4. **Add Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://uppqjivvmwghpukefjik.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

**Option B: Direct Deploy**

```bash
npm install -g vercel
vercel
```

## 📋 Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔗 Useful Links

- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.io/docs

## ❓ Need Help?

See `SUPABASE_SETUP.md` for detailed troubleshooting guide.
