/**
 * @fileoverview Entidad de dominio para los datos específicos del cliente Walmart por viaje.
 * Refleja la tabla walmart_trip_data y el catálogo walmart_stores.
 *
 * Notas de diseño:
 * - STR (reparto cargado) y DHD (regreso vacío) son viajes separados en BD,
 *   enlazados por trips.linked_trip_id.
 * - trip_number_walmart es visual (por mes en UI); el contador real por cliente
 *   está en trips.trip_number_client.
 * - dettes_log es JSONB para permitir adición dinámica de tiendas por viaje.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Catálogo de tiendas DETTE de Walmart (tabla walmart_stores)
// ──────────────────────────────────────────────────────────────────────────────

/** Tipos de tienda Walmart */
export type WalmartStoreType =
  | 'Bodega Aurrera'
  | 'Walmart Supercenter'
  | 'Walmart Express'
  | 'Superama'
  | 'Sam\'s Club'
  | 'AUTRE'

/**
 * Entrada del catálogo de tiendas DETTE de Walmart.
 * Permite al coordinador seleccionar tiendas al armar el viaje.
 */
export interface WalmartStoreEntity {
  id: string
  name: string
  location: string | null
  storeType: WalmartStoreType | string
  storeCode: string | null
  isActive: boolean
  createdAt: Date
}

// ──────────────────────────────────────────────────────────────────────────────
// Log de tiendas visitadas por viaje (dettes_log JSONB)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Un ítem del log de tiendas DETTE visitadas durante el viaje.
 * Se almacena como JSONB en walmart_trip_data.dettes_log.
 */
export interface DetteLogItem {
  /** FK hacia walmart_stores.id */
  storeId: string
  storeName: string
  /** Hora de cita acordada */
  appointmentAt: string | null
  /** Hora real de llegada */
  arrivedAt: string | null
  /** Hora real de salida */
  departedAt: string | null
  /** Número de parada en la ruta (1, 2, 3, ...) */
  stopNumber: number
}

// ──────────────────────────────────────────────────────────────────────────────
// Datos leg STR / DHD (cada leg puede ser un viaje separado en trips)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Datos de un leg del viaje Walmart (STR = reparto, DHD = regreso vacío).
 * Ambos se representan en la misma tabla walmart_trip_data aunque son
 * trips distintos enlazados por trips.linked_trip_id.
 */
export interface WalmartTripLeg {
  numLoad: string | null
  complementCartaPorte: string | null
  preinvoiceKm: number | null
  kmTraveled: number | null
  diesel: number | null
  casetas: number | null
  totalInvoice: number | null
}

// ──────────────────────────────────────────────────────────────────────────────
// Entidad principal de datos Walmart por viaje
// ──────────────────────────────────────────────────────────────────────────────

export type WalmartCargoType = 'refrigerado' | 'congelado' | 'fruta' | string

/**
 * Entidad completa de datos específicos del cliente Walmart para un viaje.
 * Mapeada desde la tabla walmart_trip_data.
 */
export interface WalmartTripDataEntity {
  id: string
  tripId: string

  /** Número de viaje Walmart (visual; frontend filtra por mes) */
  tripNumberWalmart: number | null
  coordinatorName: string | null
  route: string | null
  cargoType: WalmartCargoType | null
  cartaPorteWalmart: string | null
  statusWalmart: string | null

  /** Leg STR (reparto cargado) */
  str: WalmartTripLeg
  /** Leg DHD (regreso vacío) */
  dhd: WalmartTripLeg

  /** Log dinámico de tiendas DETTE visitadas */
  dettesLog: DetteLogItem[]

  /** Temperatura al momento de salida */
  departureTemperature: string | null
  departureTime: Date | null
  /** Número total de repartos (tiendas) en el viaje */
  numStores: number | null

  incidencias: string | null

  createdAt: Date
  updatedAt: Date
}

// ──────────────────────────────────────────────────────────────────────────────
// Input para crear/actualizar datos Walmart (usado en formularios)
// ──────────────────────────────────────────────────────────────────────────────

export type WalmartTripDataInput = Omit<WalmartTripDataEntity, 'id' | 'createdAt' | 'updatedAt'>
