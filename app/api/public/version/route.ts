import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM versions WHERE is_latest = true LIMIT 1`
    if (!rows[0]) return NextResponse.json({ version: '1.0.0', game_version: null, download_url: null, changelog: null })
    return NextResponse.json(rows[0])
  } catch {
    return NextResponse.json({ version: '1.0.0' })
  }
}
