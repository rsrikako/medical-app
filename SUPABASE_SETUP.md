# Supabase Migration Guide

## Step 1: Set Up Supabase Database Schema

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project (medical-wholesale-app)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content from `scripts/supabase-schema.sql`
6. Paste it into the SQL editor
7. Click **Run**

This creates:
- `categories` table
- `products` table
- `store_settings` table
- Indexes and Row Level Security policies

## Step 2: Set Up Supabase Storage

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create new bucket**
3. Name it: `product-images`
4. Set visibility to **Public** (for product image URLs to be public)
5. Click **Create bucket**

## Step 3: Verify Environment Variables

Check that `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://uppqjivvmwghpukefjik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcHFqaXZ2bXdnaHB1a2VmamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzI5NDMsImV4cCI6MjEwMDQ0ODk0M30.Y0P48xED7baAGweOzJhvmUITTB-NkbnrlNbx3UvQVyU
SUPABASE_DB_PASSWORD=&E+jNPrKTe3E*/q
```

(Credentials provided during project setup)

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

### Test the admin panel:
1. Go to http://localhost:3000/admin
2. Try adding a category
3. Try adding a product
4. Check if data appears in Supabase (Dashboard → Table Editor)

## Step 6: Import Existing Data (Optional)

If you have Firestore data you want to migrate:

1. Export your Firestore data (Firebase Console → Firestore → Export Collection)
2. Convert to CSV or JSON
3. Use Supabase Table Editor to import data manually, OR
4. Write a migration script using `supabase/client.ts`

For now, you can populate data through the admin panel.

## Step 7: Deploy to Vercel

### Option A: Connect GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Migrate from Firebase to Supabase"
   git push
   ```

2. Go to https://vercel.com
3. Click **Import Project**
4. Select your GitHub repository
5. Vercel will auto-detect Next.js
6. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
7. Click **Deploy**

### Option B: Deploy directly

```bash
npm install -g vercel
vercel
```

Then follow the prompts.

## Step 8: Set Supabase Storage CORS (For Vercel URL)

After deploying to Vercel, update Supabase Storage CORS:

1. In Supabase dashboard → Storage → product-images
2. Click the three dots → Settings
3. Update CORS to include your Vercel domain:
```json
[
  {
    "origin": ["https://your-vercel-domain.vercel.app"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 86400
  }
]
```

## Troubleshooting

### Products/Categories not loading?
- Check `.env.local` has correct SUPABASE_URL and ANON_KEY
- Check Supabase Storage bucket name is `product-images`
- Check RLS policies are enabled (optional but recommended)

### Images not uploading?
- Ensure `product-images` bucket exists and is public
- Check Vercel URL is added to CORS policy
- Check file size < 50MB

### Data not persisting?
- Verify database connection in Supabase dashboard
- Check table names match (snake_case in DB, camelCase in code)
- Review browser console for Supabase errors

## Database Schema Reference

### Products Table
```
id: TEXT (primary key)
sku: TEXT (unique)
name: TEXT
category_id: TEXT (foreign key → categories.id)
category_name: TEXT
brand: TEXT
pack_count: TEXT
strength: TEXT
form: TEXT
description: TEXT
image_url: TEXT
status: TEXT ('active' or 'inactive')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Categories Table
```
id: TEXT (primary key)
name: TEXT
slug: TEXT (unique)
display_order: INTEGER
status: TEXT ('active' or 'inactive')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Store Settings Table
```
id: TEXT (primary key, default 'default')
business_name: TEXT
whatsapp_number: TEXT
contact_phone: TEXT
logo_url: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```
