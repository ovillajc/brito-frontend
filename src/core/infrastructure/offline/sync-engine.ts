/**
 * @fileoverview Motor de sincronización offline.
 *
 * Se ejecuta cuando el browser recupera la conexión a internet.
 * Procesa la cola de mutaciones en orden FIFO:
 *   1. Sube los archivos pendientes a R2
 *   2. Inyecta las URLs en los payloads correspondientes
 *   3. Llama a los Server Actions en orden
 *   4. Limpia la cola y los registros locales sincronizados
 */

import {
  getPendingMutations,
  getPendingFiles,
  markSyncing,
  markDone,
  markError,
  markFileUploaded,
  deleteFilesForMutation,
  markRecordSynced,
  cleanSyncedRecords,
} from './offline-queue'
import type { PendingMutation } from './db'
import type { OfflineModule } from './db'

// ── Tipo del dispatcher ───────────────────────────────────────────────────────

/**
 * Función que mapea un actionName → la función real del Server Action.
 * El ConnectivityProvider inyecta este mapa al inicializar el SyncEngine.
 */
export type ActionDispatcher = (
  actionName: string,
  payload: unknown
) => Promise<{ ok: boolean; error?: { message: string }; data?: unknown }>

// ── Tipo del uploader de archivos ─────────────────────────────────────────────

/**
 * Función que sube un archivo a R2 y devuelve la URL pública.
 */
export type FileUploader = (
  fileName: string,
  mimeType: string,
  folder: string,
  data: ArrayBuffer
) => Promise<string>

// ── Callbacks del engine ──────────────────────────────────────────────────────

interface SyncEngineCallbacks {
  onStart: (total: number) => void
  onProgress: (current: number, total: number) => void
  onSuccess: (label: string) => void
  onError: (label: string, message: string) => void
  onComplete: (synced: number, failed: number) => void
}

// ── Motor de sincronización ───────────────────────────────────────────────────

let isSyncing = false

/**
 * Ejecuta el ciclo de sincronización completo.
 * Es idempotente: si ya hay un ciclo en progreso, no inicia otro.
 *
 * @param dispatcher - Función que resuelve el nombre de un action a su implementación
 * @param fileUploader - Función que sube archivos a R2
 * @param callbacks - Callbacks para actualizar la UI
 */
export async function runSyncEngine(
  dispatcher: ActionDispatcher,
  fileUploader: FileUploader,
  callbacks: SyncEngineCallbacks
): Promise<void> {
  if (isSyncing) return
  isSyncing = true

  try {
    const mutations = await getPendingMutations()
    if (mutations.length === 0) {
      isSyncing = false
      return
    }

    callbacks.onStart(mutations.length)

    let synced = 0
    let failed = 0

    // Paso 1: Subir archivos pendientes a R2
    const pendingFiles = await getPendingFiles()
    for (const file of pendingFiles) {
      try {
        const url = await fileUploader(file.fileName, file.mimeType, file.folder, file.data)
        await markFileUploaded(file.id!, url)
      } catch {
        // Si un archivo falla, las mutaciones que lo referencian fallarán también
        console.error(`[SyncEngine] Failed to upload file ${file.fileName}`)
      }
    }

    // Paso 2: Procesar mutaciones en orden FIFO
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i]
      callbacks.onProgress(i + 1, mutations.length)

      await markSyncing(mutation.id!)

      // Inyectar URLs de archivos en el payload
      const enrichedPayload = await injectFileUrls(mutation)

      // Llamar al Server Action
      try {
        const result = await dispatcher(mutation.actionName, enrichedPayload)

        if (result.ok) {
          await markDone(mutation.id!)
          await deleteFilesForMutation(mutation.id!)

          // Marcar el registro local como sincronizado
          const serverId = extractServerId(result.data)
          if (serverId) {
            await markRecordSynced(mutation.id!, serverId)
          }

          synced++
          callbacks.onSuccess(mutation.displayLabel)
        } else {
          await markError(mutation.id!, result.error?.message ?? 'Error desconocido')
          failed++
          callbacks.onError(mutation.displayLabel, result.error?.message ?? 'Error desconocido')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        await markError(mutation.id!, message)
        failed++
        callbacks.onError(mutation.displayLabel, message)
      }
    }

    // Paso 3: Limpiar registros offline ya sincronizados
    const modules: OfflineModule[] = ['expenses', 'maintenance', 'trips', 'fuel']
    for (const mod of modules) {
      await cleanSyncedRecords(mod)
    }

    callbacks.onComplete(synced, failed)
  } finally {
    isSyncing = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Inyecta las URLs de archivos subidos a R2 en el payload de la mutación.
 * Reemplaza cualquier key que sea `fileRef_<id>` por la URL real.
 */
async function injectFileUrls(mutation: PendingMutation): Promise<unknown> {
  if (mutation.fileRefs.length === 0) return mutation.payload

  const { offlineDb } = await import('./db')
  const payload = structuredClone(mutation.payload) as Record<string, unknown>

  for (const fileId of mutation.fileRefs) {
    const file = await offlineDb.pendingFiles.get(fileId)
    if (file?.uploadedUrl) {
      // Reemplazar la clave `fileRef_<id>` por la URL pública
      const refKey = `fileRef_${fileId}`
      if (refKey in payload) {
        payload[refKey] = file.uploadedUrl
      }
      // También actualizar receiptUrl si está como placeholder
      if (payload.receiptUrl === refKey) {
        payload.receiptUrl = file.uploadedUrl
      }
    }
  }

  return payload
}

/**
 * Extrae el ID del servidor del resultado de un Server Action.
 */
function extractServerId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  return (record.id as string) ?? null
}
