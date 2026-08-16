import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)
    const hasUrl = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)

    return NextResponse.json({ ok: true, hasServiceKey, hasUrl })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
