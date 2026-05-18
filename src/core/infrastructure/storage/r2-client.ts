/**
 * @fileoverview Cliente de AWS S3 configurado para apuntar a Cloudflare R2.
 * Cloudflare R2 es compatible con la API S3, por lo que usamos el SDK oficial.
 *
 * Las credenciales se leen exclusivamente desde variables de entorno del servidor.
 */

import { S3Client } from '@aws-sdk/client-s3'

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
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
