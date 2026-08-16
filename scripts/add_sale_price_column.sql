-- Add sale_price column to products if missing
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sale_price numeric(10,2);

-- Optional: backfill sale_price from mrp where missing
UPDATE products
SET sale_price = mrp
WHERE sale_price IS NULL AND mrp IS NOT NULL;

-- NOTE: Run this against your Supabase/Postgres instance (via SQL editor or psql).
-- If your project uses RLS, ensure the executing role has permission to ALTER and UPDATE the table.
