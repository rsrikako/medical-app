import { NextResponse } from 'next/server'
import packageJson from '../../../../package.json'

export async function GET() {
  try {
    const version = process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || packageJson.version || null
    return NextResponse.json({ ok: true, version })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
