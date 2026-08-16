#!/usr/bin/env node
// Chunked upload helper for Supabase products
// Usage (dry-run validation only):
//   node scripts/upload_products_chunked.mjs --file path/to/products.json --chunk-size 250 --validate-only

import fs from 'fs/promises'
import path from 'path'

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { file: null, chunkSize: 250, validateOnly: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--file' && args[i + 1]) { out.file = args[i + 1]; i++ }
    else if (a === '--chunk-size' && args[i + 1]) { out.chunkSize = parseInt(args[i + 1], 10); i++ }
    else if (a === '--validate-only') { out.validateOnly = true }
    else if (a === '--help') { out.help = true }
  }
  return out
}

function chunkArray(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function findDuplicates(arr) {
  const seen = new Map()
  const dups = new Map()
  arr.forEach((v, idx) => {
    const key = String(v || '').toLowerCase()
    if (!key) return
    if (seen.has(key)) {
      if (!dups.has(key)) dups.set(key, [seen.get(key)])
      dups.get(key).push(idx)
    } else {
      seen.set(key, idx)
    }
  })
  return dups
}

async function main() {
  const { file, chunkSize, validateOnly, help } = parseArgs()
  if (help || !file) {
    console.log('Usage: node scripts/upload_products_chunked.mjs --file products.json [--chunk-size 250] [--validate-only]')
    process.exit(0)
  }

  const filePath = path.resolve(process.cwd(), file)
  console.log('Reading file:', filePath)
  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch (err) {
    console.error('Failed to read file:', err.message)
    process.exit(2)
  }

  let rows
  try {
    rows = JSON.parse(raw)
    if (!Array.isArray(rows)) throw new Error('JSON must be an array of product objects')
  } catch (err) {
    console.error('Failed to parse JSON:', err.message)
    process.exit(2)
  }

  console.log('Total rows found:', rows.length)

  // Normalise fields
  const normalized = rows.map((r, i) => ({
    __rowIndex: i + 1,
    id: r.id || '',
    sku: (r.sku || r.SKU || r.sku_code || '').toString().trim(),
    name: (r.name || r.product_name || r.productName || '').toString().trim(),
    brand: (r.brand || '').toString().trim(),
    category: (r.category || r.categoryName || '').toString().trim(),
    packCount: (r.pack_count || r.packCount || '').toString().trim(),
    mrp: r.mrp,
    raw: r,
  }))

  const errors = []

  // Required checks
  normalized.forEach((row) => {
    if (!row.sku) errors.push(`Row ${row.__rowIndex}: missing SKU`)
    if (!row.name) errors.push(`Row ${row.__rowIndex}: missing product name`)
    if (!row.brand) errors.push(`Row ${row.__rowIndex}: missing brand`)
    if (!row.packCount) errors.push(`Row ${row.__rowIndex}: missing pack_count`)
  })

  // Duplicate SKU / ID checks
  const skuDups = findDuplicates(normalized.map((r) => r.sku))
  const idDups = findDuplicates(normalized.map((r) => r.id))
  if (skuDups.size > 0) {
    for (const [sku, idxs] of skuDups.entries()) {
      errors.push(`Duplicate SKU '${sku}' found in rows: ${idxs.map((i) => i + 1).join(', ')}`)
    }
  }
  if (idDups.size > 0) {
    for (const [id, idxs] of idDups.entries()) {
      if (!id) continue
      errors.push(`Duplicate id '${id}' found in rows: ${idxs.map((i) => i + 1).join(', ')}`)
    }
  }

  // Report summary
  if (errors.length > 0) {
    console.error('\nValidation failed with the following errors:')
    errors.forEach((e) => console.error(' -', e))
  } else {
    console.log('\nValidation passed: no obvious issues found')
  }

  // Plan chunks
  const chunks = chunkArray(normalized, chunkSize)
  console.log('\nChunk plan:')
  console.log(` - Chunk size: ${chunkSize}`)
  console.log(` - Number of chunks: ${chunks.length}`)
  console.log(' - Sizes:', chunks.map((c) => c.length).join(', '))

  if (validateOnly) {
    console.log('\nDry-run (validate-only) complete.')
    process.exit(errors.length > 0 ? 2 : 0)
  }

  // Upload logic placeholder (requires @supabase/supabase-js and network access)
  console.log('\nNo --validate-only flag provided: upload path is not implemented in this dry-run script.\nTo implement uploads, install @supabase/supabase-js and provide SUPABASE_URL and SUPABASE_KEY environment variables.')
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(2) })
