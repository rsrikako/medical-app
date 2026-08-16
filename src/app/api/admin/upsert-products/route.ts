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

    const CHUNK_SIZE = 250
    const chunks: any[][] = []
    for (let i = 0; i < deduped.length; i += CHUNK_SIZE) chunks.push(deduped.slice(i, i + CHUNK_SIZE))

    const results: UploadResult[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      try {
        const { error } = await supabase
          .from('products')
          .upsert(chunk, { onConflict: 'sku' })

        if (error) {
          // Attempt per-row upsert to surface problematic SKUs (e.g., duplicates in DB or malformed rows)
          const perRowFailures: string[] = []
          for (const row of chunk) {
            try {
              const { error: perErr } = await supabase
                .from('products')
                .upsert(row, { onConflict: 'sku' })
              if (perErr) {
                perRowFailures.push(`${row.sku || '<no-sku>'}: ${perErr.message || String(perErr)}`)
              }
            } catch (e: any) {
              perRowFailures.push(`${row.sku || '<no-sku>'}: ${e.message || String(e)}`)
            }
          }

          results.push({ chunk: i + 1, size: chunk.length, success: false, error: `${error.message || String(error)}; perRowFailures: ${perRowFailures.join(' | ')}` })
          // stop on fatal error after diagnostics
          break
        }
        results.push({ chunk: i + 1, size: chunk.length, success: true })
      } catch (err: any) {
        results.push({ chunk: i + 1, size: chunk.length, success: false, error: err.message || String(err) })
        break
      }
    }

    return NextResponse.json({ uploaded: results.filter(r => r.success).length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
