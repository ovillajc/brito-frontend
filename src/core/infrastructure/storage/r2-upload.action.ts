'use server'

/**
 * @fileoverview Server Action para subir archivos a Cloudflare R2.
 *
 * Recibe un FormData con el archivo y la carpeta destino.
 * Devuelve la URL pública del archivo subido usando el Either Pattern.
 *
 * @param formData - FormData con los campos: `file` (File) y `folder` (string, opcional).
 * @returns Either<Failure, { url: string }>
 */

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from './r2-client'
import type { Either, Failure } from '@/src/core/domain/either'

/** Tipos de archivo permitidos para subir */
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

/** Tamaño máximo permitido en bytes (10 MB) */
const MAX_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Sube un archivo a Cloudflare R2 y devuelve su URL pública.
 *
 * @param formData - Debe incluir `file` (File) y opcionalmente `folder` (string).
 * @returns Either con Failure o { url: string }
 */
export async function uploadFileToR2Action(
  formData: FormData
): Promise<Either<Failure, { url: string }>> {
  try {
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string | null) ?? 'general'

    if (!file || !(file instanceof File)) {
      return { ok: false, error: { code: 'NO_FILE', message: 'No se recibió ningún archivo.' } }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        ok: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Tipo de archivo no permitido. Se aceptan: PDF, JPEG, PNG, WEBP.`,
        },
      }
    }

    if (file.size > MAX_SIZE_BYTES) {
      return {
        ok: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `El archivo excede el límite de 10 MB.`,
        },
      }
    }

    // Generamos un nombre único para evitar colisiones
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
    return { ok: true, data: { url } }
  } catch (err) {
    console.error('[uploadFileToR2Action] Error:', err)
    return {
      ok: false,
      error: { code: 'UPLOAD_FAILED', message: 'Error al subir el archivo a la nube.' },
    }
  }
}
