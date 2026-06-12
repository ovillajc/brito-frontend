'use client'

/**
 * @fileoverview Componente reutilizable para subir un único archivo a Cloudflare R2.
 *
 * Usa XMLHttpRequest contra /api/r2/upload-stream para poder rastrear el progreso
 * real de la subida (evento onprogress). Las Server Actions no permiten este tipo
 * de seguimiento ya que envían el body completo antes de procesar.
 *
 * Al completarse, llama al `onUploadComplete` con la URL pública del archivo.
 *
 * @molecule
 *
 * @example
 * ```tsx
 * <FileUploadButton
 *   folder="expenses/receipts"
 *   label="Subir Ticket / Factura"
 *   currentUrl={watch('receiptUrl')}
 *   onUploadComplete={(url) => setValue('receiptUrl', url)}
 *   disabled={isReadOnly}
 * />
 * ```
 */

import React, { useRef, useState, useEffect } from 'react'
import { Paperclip, CheckCircle, Loader2, XCircle, ExternalLink } from 'lucide-react'

interface FileUploadButtonProps {
  /** Carpeta dentro del bucket R2 donde se guardará el archivo. */
  folder: string
  /** Texto del botón cuando no hay archivo seleccionado. */
  label?: string
  /** URL actual del archivo (para mostrar enlace si ya existe). */
  currentUrl?: string | null
  /** Callback que recibe la URL pública una vez que la subida es exitosa. */
  onUploadComplete: (url: string) => void
  /** Si true, deshabilita el input de carga. */
  disabled?: boolean
  /** Tipos de archivo aceptados (por defecto: PDF, imágenes). */
  accept?: string
}

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; url: string }
  | { status: 'error'; message: string }

/** Sube un archivo con progreso real usando XMLHttpRequest. */
function uploadWithProgress(
  file: File,
  folder: string,
  onProgress: (pct: number) => void
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  return new Promise((resolve) => {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('folder', folder)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        // Cap at 95% until server confirms success
        onProgress(Math.round((e.loaded / e.total) * 95))
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const body = JSON.parse(xhr.responseText) as {
          ok: boolean
          data?: { url: string }
          error?: { message: string }
        }
        if (body.ok && body.data?.url) {
          resolve({ ok: true, url: body.data.url })
        } else {
          resolve({ ok: false, message: body.error?.message ?? 'Error al subir el archivo.' })
        }
      } catch {
        resolve({ ok: false, message: 'Respuesta inesperada del servidor.' })
      }
    })

    xhr.addEventListener('error', () => {
      resolve({ ok: false, message: 'Error de red al subir el archivo.' })
    })

    xhr.addEventListener('abort', () => {
      resolve({ ok: false, message: 'Subida cancelada.' })
    })

    xhr.open('POST', '/api/r2/upload-stream')
    xhr.send(formData)
  })
}

/**
 * Botón de carga de archivos con feedback de progreso real.
 */
export function FileUploadButton({
  folder,
  label = 'Adjuntar archivo',
  currentUrl,
  onUploadComplete,
  disabled = false,
  accept = 'application/pdf,image/jpeg,image/jpg,image/png,image/webp',
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploadingRef = useRef(false)
  const lastUploadSignatureRef = useRef<string | null>(null)
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const successUrl = state.status === 'success' ? state.url : null

  // Sincronizar estado interno si la URL actual es limpiada desde el exterior
  useEffect(() => {
    if (state.status === 'success' && currentUrl !== successUrl) {
      const frame = window.requestAnimationFrame(() => {
        setState({ status: 'idle' })
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [currentUrl, state.status, successUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileSignature = `${file.name}:${file.size}:${file.lastModified}`
    if (isUploadingRef.current || lastUploadSignatureRef.current === fileSignature) {
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    // Limpiar input para permitir re-seleccionar el mismo archivo tras un error
    if (inputRef.current) inputRef.current.value = ''

    isUploadingRef.current = true
    lastUploadSignatureRef.current = fileSignature
    setState({ status: 'uploading', progress: 0 })

    const result = await uploadWithProgress(file, folder, (pct) => {
      setState({ status: 'uploading', progress: pct })
    })

    isUploadingRef.current = false

    if (result.ok) {
      setState({ status: 'success', url: result.url })
      onUploadComplete(result.url)
    } else {
      setState({ status: 'error', message: result.message })
      lastUploadSignatureRef.current = null
    }
  }

  const handleRetry = () => {
    setState({ status: 'idle' })
    inputRef.current?.click()
  }

  const effectiveUrl = state.status === 'success' ? state.url : currentUrl

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || state.status === 'uploading'}
        onChange={handleFileChange}
      />

      {/* Estado idle o error */}
      {(state.status === 'idle' || state.status === 'error') && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-stone-300 dark:border-zinc-600 text-sm text-stone-500 dark:text-zinc-400 hover:border-[#1a5c3a] hover:text-[#1a5c3a] dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            <Paperclip className="size-4" />
            {effectiveUrl ? 'Reemplazar archivo' : label}
          </button>
          {state.status === 'error' && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <XCircle className="size-3 shrink-0" />
              {state.message}
              <button type="button" onClick={handleRetry} className="underline ml-1 hover:no-underline">
                Reintentar
              </button>
            </p>
          )}
        </div>
      )}

      {/* Estado de subida con progreso real */}
      {state.status === 'uploading' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-sm text-stone-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin text-[#1a5c3a]" />
              Subiendo archivo…
            </span>
            <span className="text-xs font-medium text-[#1a5c3a] tabular-nums">{state.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1a5c3a] rounded-full transition-all duration-200"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* URL actual o subida exitosa */}
      {effectiveUrl && state.status !== 'uploading' && (
        <a
          href={effectiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#1a5c3a] dark:text-emerald-400 hover:underline"
        >
          <CheckCircle className="size-3.5 shrink-0" />
          <span className="truncate max-w-[260px]">
            {state.status === 'success' ? 'Archivo subido — Ver documento' : 'Ver documento actual'}
          </span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      )}
    </div>
  )
}
