import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type UploadResult = {
  chunk: number
  size: number
  success: boolean
  error?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be an array of product objects' }, { status: 400 })
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server missing Supabase service key configuration' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Normalize and dedupe by SKU (case-insensitive), drop empty SKUs
    const normalized = body.map((r: any, i: number) => ({
      ...r,
      _rowIndex: i + 1,
      sku: (r.sku || r.SKU || '').toString().trim(),
    }))

    const map = new Map<string, any>()
    for (const r of normalized) {
      if (!r.sku) continue
      const key = r.sku.toLowerCase()
      // keep last occurrence (overwrite previous)
      map.set(key, { ...r, sku: r.sku })
    }
    const deduped = Array.from(map.values())

    // Sanitize objects to include only allowed DB columns (drop _rowIndex and other extras)
    const allowedCols = (r: any) => ({
      id: r.id || undefined,
      sku: r.sku,
      name: r.name || r.product_name || undefined,
      category_id: r.category_id || r.categoryId || r.category || undefined,
      category_name: r.category_name || r.categoryName || r.category || undefined,
      brand: r.brand || undefined,
      pack_count: r.pack_count || r.packCount || undefined,
      strength: r.strength || undefined,
      form: r.form || undefined,
      mrp: r.mrp === undefined ? undefined : Number(r.mrp),
      description: r.description || undefined,
      status: r.status || 'active',
      created_at: r.created_at || undefined,
      updated_at: r.updated_at || undefined,
      image_url: r.image_url || undefined,
    })

    const payload = deduped.map(allowedCols)

    const CHUNK_SIZE = parseInt(process.env.UPLOAD_CHUNK_SIZE || '500', 10)
    const CONCURRENCY = parseInt(process.env.UPLOAD_CONCURRENCY || '4', 10)
    const RETRIES = parseInt(process.env.UPLOAD_RETRIES || '3', 10)

    const chunks: any[][] = []
    for (let i = 0; i < payload.length; i += CHUNK_SIZE) chunks.push(payload.slice(i, i + CHUNK_SIZE))

    const results: UploadResult[] = []

    // helper: upsert with retries
    const upsertChunkWithRetries = async (chunk: any[], index: number): Promise<UploadResult> => {
      let attempt = 0
      while (attempt < RETRIES) {
        try {
          const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'sku' })
          if (error) throw error
          return { chunk: index + 1, size: chunk.length, success: true }
        } catch (err: any) {
          attempt++
          if (attempt >= RETRIES) {
            return { chunk: index + 1, size: chunk.length, success: false, error: err.message || String(err) }
          }
          // exponential backoff
          const backoffMs = 200 * Math.pow(2, attempt)
          await new Promise((res) => setTimeout(res, backoffMs))
        }
      }
      return { chunk: -1, size: 0, success: false, error: 'unreachable' }
    }

    // concurrency pool
    const pool: Promise<void>[] = []
    let nextIndex = 0

    const worker = async () => {
      while (true) {
        const i = nextIndex++
        if (i >= chunks.length) break
        const chunk = chunks[i]
        const res = await upsertChunkWithRetries(chunk, i)
        results.push(res)
        if (!res.success) {
          // stop further workers on fatal chunk error
          nextIndex = chunks.length
          break
        }
      }
    }

    for (let w = 0; w < Math.min(CONCURRENCY, chunks.length); w++) {
      pool.push(worker())
    }

    await Promise.all(pool)

    return NextResponse.json({ uploaded: results.filter(r => r.success).length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
