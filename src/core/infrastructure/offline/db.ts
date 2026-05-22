import Dexie, { type Table } from 'dexie'

/**
 * Schema de la base de datos local (IndexedDB) para el modo offline.
 *
 * Stores:
 * - `pendingMutations` — Cola FIFO de acciones pendientes de sincronizar con Supabase.
 * - `pendingFiles`     — Archivos (tickets, facturas) pendientes de subir a R2.
 * - `cachedCatalogs`   — Catálogos estáticos (categorías, operadores, etc.) para lectura offline.
 * - `offlineRecords`   — Registros creados offline para que el usuario los visualice localmente.
 */

// ── Tipos del schema ──────────────────────────────────────────────────────────

/** Estado de una mutación en la cola. */
export type MutationStatus = 'pending' | 'syncing' | 'error' | 'done'

/** Módulos que soportan escritura offline. */
export type OfflineModule = 'expenses' | 'maintenance' | 'trips' | 'fuel'

/**
 * Una mutación pendiente representa una acción (create/update) que el usuario realizó
 * sin conexión y que debe sincronizarse cuando la red vuelva.
 */
export interface PendingMutation {
  /** Autoincrement. Determina el orden FIFO de sincronización. */
  id?: number
  /** UUID generado en cliente para idempotencia (evita duplicados). */
  idempotencyKey: string
  /** Módulo al que pertenece la mutación. */
  module: OfflineModule
  /** Nombre del Server Action a invocar al sincronizar. Ej: 'createExpenseAction' */
  actionName: string
  /** Payload serializado del formulario (JSON). */
  payload: unknown
  /** IDs de PendingFile que deben subirse antes de ejecutar esta mutación. */
  fileRefs: number[]
  /** Fecha en que se encoló la mutación. */
  createdAt: Date
  /** Número de intentos de sincronización fallidos. */
  retries: number
  /** Estado actual. */
  status: MutationStatus
  /** Mensaje del último error, si hubo. */
  errorMessage?: string
  /** Etiqueta legible para mostrar al usuario en la UI de sync. */
  displayLabel: string
}

/**
 * Un archivo (imagen/PDF) pendiente de subir a Cloudflare R2.
 * Se guarda como ArrayBuffer en IndexedDB hasta que haya conexión.
 */
export interface PendingFile {
  /** Autoincrement. */
  id?: number
  /** ID de la PendingMutation a la que pertenece este archivo. */
  mutationRef?: number
  /** Nombre original del archivo. */
  fileName: string
  /** MIME type: 'image/jpeg', 'application/pdf', etc. */
  mimeType: string
  /** Carpeta de destino en R2. Ej: 'expenses/receipts' */
  folder: string
  /** Contenido del archivo como ArrayBuffer (max 5MB). */
  data: ArrayBuffer
  /** URL pública de R2 una vez subido. Se usa para inyectar en el payload. */
  uploadedUrl?: string
  /** Fecha de creación. */
  createdAt: Date
}

/**
 * Un catálogo cacheado localmente para formularios offline.
 * Ej: categorías de gastos, operadores, unidades de medida.
 */
export interface CachedCatalog {
  /** Identificador único del catálogo. Ej: 'expense_categories' */
  id: string
  /** Los datos del catálogo (array de entidades). */
  data: unknown
  /** Cuándo se cacheó. Se usa para TTL. */
  cachedAt: Date
}

/**
 * Un registro creado offline que el usuario puede ver localmente
 * antes de que se sincronice. Solo registros propios del cliente.
 */
export interface OfflineRecord {
  /** ID local generado en cliente. */
  id: string
  /** Módulo al que pertenece. */
  module: OfflineModule
  /** Los datos del formulario para mostrar en tabla local. */
  data: unknown
  /** ID de la PendingMutation asociada. */
  mutationId?: number
  /** Fecha de creación local. */
  createdAt: Date
  /** Si ya se sincronizó y tiene ID del servidor. */
  syncedServerId?: string
}

// ── Clase de la DB ────────────────────────────────────────────────────────────

class BritoDB extends Dexie {
  pendingMutations!: Table<PendingMutation>
  pendingFiles!: Table<PendingFile>
  cachedCatalogs!: Table<CachedCatalog>
  offlineRecords!: Table<OfflineRecord>

  constructor() {
    super('brito-offline-db')
    this.version(1).stores({
      pendingMutations: '++id, idempotencyKey, module, status, createdAt',
      pendingFiles: '++id, mutationRef',
      cachedCatalogs: 'id, cachedAt',
      offlineRecords: 'id, module, mutationId, createdAt',
    })
  }
}

/** Instancia singleton de la base de datos offline. */
export const offlineDb = new BritoDB()
