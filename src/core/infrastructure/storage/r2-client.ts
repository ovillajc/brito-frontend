/**
 * @fileoverview Cliente de AWS S3 configurado para apuntar a Cloudflare R2.
 * Cloudflare R2 es compatible con la API S3, por lo que usamos el SDK oficial.
 *
 * Las credenciales se leen exclusivamente desde variables de entorno del servidor.
 */

import 'server-only'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Either, Failure } from '@/src/core/domain/either'

/**
 * Instancia compartida del cliente S3 configurada para Cloudflare R2.
 * Solo debe usarse en el servidor (Server Actions / API Routes).
 */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
})

/** Nombre del bucket de R2 obtenido desde variables de entorno. */
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? ''

/** URL pública base para acceder a los archivos subidos (dominio público de R2). */
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? ''

export function getR2KeyFromPublicUrl(url: string): string | null {
  const baseRaw = R2_PUBLIC_URL.replace(/\/+$/, '')
  if (!baseRaw) return null

  try {
    const base = new URL(baseRaw)
    const target = new URL(url)

    if (target.origin !== base.origin) return null

    const key = target.pathname.replace(/^\/+/, '')
    return key ? key : null
  } catch {
    return null
  }
}

export async function deleteR2ObjectByPublicUrl(url: string): Promise<Either<Failure, true>> {
  try {
    const key = getR2KeyFromPublicUrl(url)
    if (!key) return { ok: false, error: { code: 'INVALID_URL', message: 'URL inválida para eliminar archivo.' } }
    if (!R2_BUCKET_NAME) return { ok: false, error: { code: 'MISCONFIGURED', message: 'Bucket R2 no configurado.' } }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    )

    return { ok: true, data: true }
  } catch (err) {
    return {
      ok: false,
      error: { code: 'DELETE_FAILED', message: err instanceof Error ? err.message : 'Error al eliminar archivo.' },
    }
  }
}
