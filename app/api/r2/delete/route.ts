
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { deleteR2ObjectByPublicUrl } from '@/src/core/infrastructure/storage/r2-client'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') ?? ''
  const expected = process.env.MOBILE_CHAT_API_KEY ?? ''
  if (!expected || apiKey !== expected) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
      { status: 401 }
    )
  }

  const body = await req.json().catch(() => null)
  const url = body && typeof body === 'object' && 'url' in body ? (body.url as unknown) : null
  if (typeof url !== 'string' || url.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'URL inválida' } },
      { status: 400 }
    )
  }

  await deleteR2ObjectByPublicUrl(url)
  return NextResponse.json({ ok: true, data: { deleted: true } })
}
