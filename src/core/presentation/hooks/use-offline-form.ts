'use client'

/**
 * @fileoverview Hook central para formularios con soporte offline.
 *
 * Este hook abstrae la lógica de decidir si una acción se ejecuta
 * en el servidor (cuando hay red) o se encola offline (cuando no hay red).
 *
 * Uso:
 * ```tsx
 * const { execute, isLoading } = useOfflineForm({
 *   module: 'expenses',
 *   actionName: 'createExpenseAction',
 *   displayLabel: 'Gasto de gasolina',
 *   onlineAction: createExpenseAction,
 *   offlinePayload: formValues,
 *   offlineDisplayData: { description: formValues.description, amount: formValues.amount },
 * })
 * ```
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useConnectivityStore } from '../stores/use-connectivity-store'
import {
  enqueueMutation,
  enqueueFile,
  linkFilesToMutation,
  saveOfflineRecord,
} from '@/src/core/infrastructure/offline/offline-queue'
import type { OfflineModule } from '@/src/core/infrastructure/offline/db'
import type { Either, Failure } from '@/src/core/domain/either'

// #region debug-point expense-create-missing-reporter
const __DBG_URL = process.env.NEXT_PUBLIC_DEBUG_SERVER_URL ?? ''
const __DBG_SESSION = process.env.NEXT_PUBLIC_DEBUG_SESSION_ID ?? ''
const __DBG_RUN_ID = process.env.NEXT_PUBLIC_DEBUG_RUN_ID ?? ''

async function dbgReport(event: string, data: Record<string, unknown> = {}) {
  if (!__DBG_URL || !__DBG_SESSION) return
  try {
    await fetch(__DBG_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ts: new Date().toISOString(),
        sessionId: __DBG_SESSION,
        runId: __DBG_RUN_ID || undefined,
        event,
        data,
      }),
      cache: 'no-store',
    })
  } catch {}
}
// #endregion debug-point expense-create-missing-reporter

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface PendingFileConfig {
  /** Nombre del campo en el payload donde va la URL (ej: 'receiptUrl') */
  fieldName: string
  fileName: string
  mimeType: string
  folder: string
  data: ArrayBuffer
}

interface UseOfflineFormOptions<TInput, TOutput> {
  /** Módulo al que pertenece el formulario. */
  module: OfflineModule
  /** Nombre del Server Action para el SyncEngine. */
  actionName: string
  /** Etiqueta legible para notificaciones de sync. */
  displayLabel: string
  /** La función del Server Action a llamar cuando hay red. */
  onlineAction: (input: TInput) => Promise<Either<Failure, TOutput>>
  /** Archivos a adjuntar (si aplica). Se guardan en IndexedDB si no hay red. */
  pendingFiles?: PendingFileConfig[]
}

interface UseOfflineFormResult<TInput, TOutput> {
  /** Ejecuta la acción: online → Server Action, offline → encola en IndexedDB. */
  execute: (
    payload: TInput,
    offlineDisplayData: Record<string, unknown>
  ) => Promise<{ ok: boolean; data?: TOutput; offline?: boolean; error?: string }>
  isLoading: boolean
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook central para formularios con soporte offline.
 *
 * @param options - Configuración del módulo, acción y archivos.
 * @returns `execute` (función principal) e `isLoading` (para deshabilitar UI).
 */
export function useOfflineForm<TInput, TOutput>({
  module,
  actionName,
  displayLabel,
  onlineAction,
  pendingFiles = [],
}: UseOfflineFormOptions<TInput, TOutput>): UseOfflineFormResult<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false)
  const isOnline = useConnectivityStore((s) => s.status !== 'offline')
  const isSubmitBlocked = useConnectivityStore((s) => s.isSubmitBlocked)
  const setPendingCount = useConnectivityStore((s) => s.setPendingCount)
  const pendingCount = useConnectivityStore((s) => s.pendingCount)

  const execute = useCallback(async (
    payload: TInput,
    offlineDisplayData: Record<string, unknown>
  ) => {
    // #region debug-point expense-create-missing-execute-start
    void dbgReport('offlineForm.execute.start', {
      module,
      actionName,
      isOnline,
      isSubmitBlocked,
      pendingFiles: pendingFiles.length,
    })
    // #endregion debug-point expense-create-missing-execute-start

    if (isSubmitBlocked) {
      const message = 'Sincronización en progreso. Espera un momento antes de guardar.'
      toast.warning(message)
      // #region debug-point expense-create-missing-execute-blocked
      void dbgReport('offlineForm.execute.blocked', { module, actionName, message })
      // #endregion debug-point expense-create-missing-execute-blocked
      return { ok: false, error: message }
    }

    setIsLoading(true)

    try {
      // ── Modo online: llamar al Server Action directamente ──────────────────
      if (isOnline) {
        const result = await onlineAction(payload)
        if (!result.ok) {
          toast.error(result.error.message)
          // #region debug-point expense-create-missing-execute-online-failed
          void dbgReport('offlineForm.execute.online_failed', {
            module,
            actionName,
            errorCode: result.error.code,
            errorMessage: result.error.message,
            statusCode: (result.error as unknown as { statusCode?: unknown } | null | undefined)?.statusCode ?? null,
          })
          // #endregion debug-point expense-create-missing-execute-online-failed
          return { ok: false, error: result.error.message }
        }
        // #region debug-point expense-create-missing-execute-online-ok
        void dbgReport('offlineForm.execute.online_ok', { module, actionName })
        // #endregion debug-point expense-create-missing-execute-online-ok
        return { ok: true, data: result.data }
      }

      // ── Modo offline: encolar en IndexedDB ────────────────────────────────
      // #region debug-point expense-create-missing-execute-offline
      void dbgReport('offlineForm.execute.offline_path', { module, actionName })
      // #endregion debug-point expense-create-missing-execute-offline

      // 1. Guardar archivos en IndexedDB (si los hay)
      const fileIds: number[] = []
      const enrichedPayload = { ...(payload as Record<string, unknown>) }

      for (const file of pendingFiles) {
        if (file.data.byteLength > 5 * 1024 * 1024) {
          toast.error(`El archivo "${file.fileName}" supera 5MB y no puede guardarse offline.`)
          continue
        }
        const fileId = await enqueueFile(file.fileName, file.mimeType, file.folder, file.data)
        fileIds.push(fileId)
        // Marcar el campo del payload con un placeholder del fileId
        enrichedPayload[file.fieldName] = `fileRef_${fileId}`
      }

      // 2. Encolar la mutación
      const mutationId = await enqueueMutation(
        module,
        actionName,
        enrichedPayload,
        displayLabel,
        fileIds
      )

      // 3. Vincular archivos a la mutación
      if (fileIds.length > 0) {
        await linkFilesToMutation(fileIds, mutationId)
      }

      // 4. Guardar registro local para visualización
      await saveOfflineRecord(module, offlineDisplayData, mutationId)

      // 5. Actualizar contador en el store
      setPendingCount(pendingCount + 1)

      toast.success(`"${displayLabel}" guardado localmente — Se sincronizará cuando haya conexión`, {
        duration: 4000,
      })

      return { ok: true, offline: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      toast.error(`Error al guardar: ${message}`)
      // #region debug-point expense-create-missing-execute-exception
      void dbgReport('offlineForm.execute.exception', { module, actionName, message })
      // #endregion debug-point expense-create-missing-execute-exception
      return { ok: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [
    isOnline, isSubmitBlocked, onlineAction, module, actionName,
    displayLabel, pendingFiles, setPendingCount, pendingCount
  ])

  return { execute, isLoading }
}
