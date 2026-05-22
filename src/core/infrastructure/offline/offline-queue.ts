/**
 * @fileoverview Servicio para gestionar la cola de mutaciones offline en IndexedDB.
 *
 * Provee funciones para encolar, leer y actualizar el estado de las mutaciones
 * pendientes de sincronización con Supabase.
 */

import { offlineDb, type OfflineModule, type PendingMutation, type PendingFile, type OfflineRecord } from './db'

// ── Mutaciones ────────────────────────────────────────────────────────────────

/**
 * Encola una nueva mutación en la cola offline.
 *
 * @param module - Módulo al que pertenece (expenses, trips, etc.)
 * @param actionName - Nombre del Server Action a llamar al sincronizar
 * @param payload - Datos del formulario
 * @param displayLabel - Etiqueta legible para el usuario
 * @param fileRefs - IDs de archivos pendientes asociados
 * @returns El ID asignado a la mutación en la cola
 */
export async function enqueueMutation(
  module: OfflineModule,
  actionName: string,
  payload: unknown,
  displayLabel: string,
  fileRefs: number[] = []
): Promise<number> {
  const id = await offlineDb.pendingMutations.add({
    idempotencyKey: crypto.randomUUID(),
    module,
    actionName,
    payload,
    fileRefs,
    createdAt: new Date(),
    retries: 0,
    status: 'pending',
    displayLabel,
  })
  return id as number
}

/**
 * Obtiene todas las mutaciones pendientes ordenadas por fecha de creación (FIFO).
 */
export async function getPendingMutations(): Promise<PendingMutation[]> {
  return offlineDb.pendingMutations
    .where('status')
    .anyOf(['pending', 'error'])
    .sortBy('createdAt')
}

/**
 * Obtiene el conteo de mutaciones pendientes.
 */
export async function getPendingCount(): Promise<number> {
  return offlineDb.pendingMutations
    .where('status')
    .anyOf(['pending', 'error'])
    .count()
}

/**
 * Marca una mutación como "syncing" (en proceso de sincronización).
 */
export async function markSyncing(id: number): Promise<void> {
  await offlineDb.pendingMutations.update(id, { status: 'syncing' })
}

/**
 * Marca una mutación como completada y la elimina de la cola.
 */
export async function markDone(id: number): Promise<void> {
  await offlineDb.pendingMutations.delete(id)
}

/**
 * Marca una mutación como fallida e incrementa el contador de reintentos.
 */
export async function markError(id: number, message: string): Promise<void> {
  const mutation = await offlineDb.pendingMutations.get(id)
  if (!mutation) return
  await offlineDb.pendingMutations.update(id, {
    status: mutation.retries >= 3 ? 'error' : 'pending',
    retries: mutation.retries + 1,
    errorMessage: message,
  })
}

// ── Archivos ──────────────────────────────────────────────────────────────────

/**
 * Guarda un archivo en IndexedDB para subir a R2 cuando haya conexión.
 *
 * @param fileName - Nombre original del archivo
 * @param mimeType - Tipo MIME del archivo
 * @param folder - Carpeta de destino en R2
 * @param data - Contenido del archivo como ArrayBuffer
 * @returns El ID asignado al archivo en IndexedDB
 */
export async function enqueueFile(
  fileName: string,
  mimeType: string,
  folder: string,
  data: ArrayBuffer
): Promise<number> {
  const id = await offlineDb.pendingFiles.add({
    fileName,
    mimeType,
    folder,
    data,
    createdAt: new Date(),
  })
  return id as number
}

/**
 * Vincula un archivo a una mutación (se llama después de encolar la mutación).
 */
export async function linkFilesToMutation(fileIds: number[], mutationId: number): Promise<void> {
  for (const fileId of fileIds) {
    await offlineDb.pendingFiles.update(fileId, { mutationRef: mutationId })
  }
}

/**
 * Obtiene los archivos sin URL de subida (pendientes de subir a R2).
 */
export async function getPendingFiles(): Promise<PendingFile[]> {
  return offlineDb.pendingFiles
    .filter((f) => !f.uploadedUrl)
    .toArray()
}

/**
 * Actualiza la URL pública de un archivo tras haberlo subido a R2.
 */
export async function markFileUploaded(id: number, url: string): Promise<void> {
  await offlineDb.pendingFiles.update(id, { uploadedUrl: url })
}

/**
 * Elimina los archivos asociados a una mutación completada.
 */
export async function deleteFilesForMutation(mutationId: number): Promise<void> {
  await offlineDb.pendingFiles.where('mutationRef').equals(mutationId).delete()
}

// ── Registros offline (para visualización local) ──────────────────────────────

/**
 * Guarda un registro offline para que el usuario lo vea en la tabla local
 * mientras no hay conexión.
 */
export async function saveOfflineRecord(
  module: OfflineModule,
  data: unknown,
  mutationId?: number
): Promise<void> {
  await offlineDb.offlineRecords.add({
    id: crypto.randomUUID(),
    module,
    data,
    mutationId,
    createdAt: new Date(),
  })
}

/**
 * Obtiene los registros offline de un módulo para mostrar en la tabla local.
 */
export async function getOfflineRecords(module: OfflineModule): Promise<OfflineRecord[]> {
  return offlineDb.offlineRecords
    .where('module')
    .equals(module)
    .reverse()
    .sortBy('createdAt')
}

/**
 * Marca un registro offline como sincronizado con el ID del servidor.
 */
export async function markRecordSynced(mutationId: number, serverId: string): Promise<void> {
  const record = await offlineDb.offlineRecords
    .where('mutationId')
    .equals(mutationId)
    .first()
  if (record?.id) {
    await offlineDb.offlineRecords.update(record.id, { syncedServerId: serverId })
  }
}

/**
 * Elimina los registros offline que ya fueron sincronizados.
 */
export async function cleanSyncedRecords(module: OfflineModule): Promise<void> {
  await offlineDb.offlineRecords
    .where('module')
    .equals(module)
    .filter((r) => !!r.syncedServerId)
    .delete()
}
