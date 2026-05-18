'use client'

/**
 * @fileoverview Componente reutilizable para subir un único archivo a Cloudflare R2.
 *
 * Muestra un botón de carga con feedback visual (progreso, éxito, error).
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

import React, { useRef, useState } from 'react'
import { Paperclip, CheckCircle, Loader2, XCircle, ExternalLink } from 'lucide-react'
import { uploadFileToR2Action } from '@/src/core/infrastructure/storage/r2-upload.action'

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

/**
 * Botón de carga de archivos con feedback visual integrado.
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
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setState({ status: 'uploading', progress: 0 })

    const formData = new FormData()
    formData.set('file', file)
    formData.set('folder', folder)

    // Simulamos progreso visual mientras se sube
    const progressInterval = setInterval(() => {
      setState((prev) =>
        prev.status === 'uploading' && prev.progress < 85
          ? { status: 'uploading', progress: prev.progress + 15 }
          : prev
      )
    }, 300)

    const result = await uploadFileToR2Action(formData)
    clearInterval(progressInterval)

    if (result.ok) {
      setState({ status: 'success', url: result.data.url })
      onUploadComplete(result.data.url)
    } else {
      setState({ status: 'error', message: result.error.message })
    }

    // Limpiamos el input para permitir re-subir el mismo archivo
    if (inputRef.current) inputRef.current.value = ''
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

      {/* Estado idle o URL existente */}
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

      {/* Estado de subida */}
      {state.status === 'uploading' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-zinc-400">
            <Loader2 className="size-4 animate-spin text-[#1a5c3a]" />
            <span>Subiendo archivo...</span>
          </div>
          <div className="h-1.5 w-full bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1a5c3a] rounded-full transition-all duration-300"
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
