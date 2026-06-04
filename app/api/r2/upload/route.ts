import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/src/core/infrastructure/storage/r2-client'

export const runtime = 'nodejs'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  // ── Auth: verificar API Key ───────────────────────────────────────────────
  const apiKey = req.headers.get('x-api-key') ?? ''
  // Mantengo la lectura de MOBILE_CHAT_API_KEY en el backend, 
  // aunque en la app móvil la variable se llame BACKEND_API_KEY
  const expected = process.env.MOBILE_CHAT_API_KEY ?? ''
  
  if (!expected || apiKey !== expected) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
      { status: 401 }
    )
  }

  // ── Parse multipart form ────────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch (err) {
    console.error('[upload-api] Error procesando body:', err)
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_BODY', message: 'Cuerpo de la solicitud inválido o demasiado grande' } },
      { status: 400 }
    )
  }

  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'general'

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: { code: 'NO_FILE', message: 'No se recibió ningún archivo.' } },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_TYPE', message: 'Tipo de archivo no permitido. Se aceptan: PDF, JPEG, PNG, WEBP.' } },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'El archivo excede el límite de 10 MB.' } },
      { status: 400 }
    )
  }

  // ── Upload a R2 ─────────────────────────────────────────────────────────────
  try {
    const ext = file.name.split('.').pop() ?? 'bin'
    const key = `${folder}/${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
      })
    )

    const url = `${R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ ok: true, data: { url } })
  } catch (err) {
    console.error('[upload-api] Error subiendo a R2:', err)
    return NextResponse.json(
      { ok: false, error: { code: 'UPLOAD_FAILED', message: 'Error al subir el archivo a la nube.' } },
      { status: 500 }
    )
  }
}
