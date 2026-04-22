/**
 * @fileoverview Mapper para transformar DTOs de Supabase a Entidades de Dominio
 * de datos específicos del cliente Walmart.
 */

import type {
  WalmartTripDataEntity,
  WalmartStoreEntity,
  DetteLogItem,
  WalmartTripLeg,
  WalmartStoreType,
} from '../../domain/entities/walmart-trip-entity'

// ──────────────────────────────────────────────────────────────────────────────
// Raw DB types
// ──────────────────────────────────────────────────────────────────────────────

export interface WalmartTripDataRow {
  id: string
  trip_id: string
  trip_number_walmart: number | null
  coordinator_name: string | null
  route: string | null
  cargo_type: string | null
  carta_porte_walmart: string | null
  status_walmart: string | null
  str_num_load: string | null
  str_complement_carta_porte: string | null
  str_preinvoice_km: number | null
  str_km_traveled: number | null
  str_diesel: number | null
  str_casetas: number | null
  str_total_invoice: number | null
  dhd_num_load: string | null
  dhd_complement_carta_porte: string | null
  dhd_preinvoice_km: number | null
  dhd_km_traveled: number | null
  dhd_diesel: number | null
  dhd_casetas: number | null
  dhd_total_invoice: number | null
  dettes_log: unknown
  departure_temperature: string | null
  departure_time: string | null
  num_stores: number | null
  incidencias: string | null
  created_at: string
  updated_at: string
}

export interface WalmartStoreRow {
  id: string
  name: string
  location: string | null
  store_type: string | null
  store_code: string | null
  is_active: boolean
  created_at: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Mapper
// ──────────────────────────────────────────────────────────────────────────────

export class WalmartTripMapper {
  /**
   * Transforma un row de walmart_trip_data a la entidad de dominio.
   */
  static toDomain(row: WalmartTripDataRow): WalmartTripDataEntity {
    const str: WalmartTripLeg = {
      numLoad: row.str_num_load,
      complementCartaPorte: row.str_complement_carta_porte,
      preinvoiceKm: row.str_preinvoice_km,
      kmTraveled: row.str_km_traveled,
      diesel: row.str_diesel,
      casetas: row.str_casetas,
      totalInvoice: row.str_total_invoice,
    }

    const dhd: WalmartTripLeg = {
      numLoad: row.dhd_num_load,
      complementCartaPorte: row.dhd_complement_carta_porte,
      preinvoiceKm: row.dhd_preinvoice_km,
      kmTraveled: row.dhd_km_traveled,
      diesel: row.dhd_diesel,
      casetas: row.dhd_casetas,
      totalInvoice: row.dhd_total_invoice,
    }

    // Parse JSONB safely
    const dettesLog = WalmartTripMapper.parseDettesLog(row.dettes_log)

    return {
      id: row.id,
      tripId: row.trip_id,
      tripNumberWalmart: row.trip_number_walmart,
      coordinatorName: row.coordinator_name,
      route: row.route,
      cargoType: row.cargo_type,
      cartaPorteWalmart: row.carta_porte_walmart,
      statusWalmart: row.status_walmart,
      str,
      dhd,
      dettesLog,
      departureTemperature: row.departure_temperature,
      departureTime: row.departure_time ? new Date(row.departure_time) : null,
      numStores: row.num_stores,
      incidencias: row.incidencias,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  /**
   * Transforma la entidad a payload para upsert en walmart_trip_data.
   */
  static toInsert(entity: Omit<WalmartTripDataEntity, 'id' | 'createdAt' | 'updatedAt'>): Record<string, unknown> {
    return {
      trip_id: entity.tripId,
      trip_number_walmart: entity.tripNumberWalmart,
      coordinator_name: entity.coordinatorName,
      route: entity.route,
      cargo_type: entity.cargoType,
      carta_porte_walmart: entity.cartaPorteWalmart,
      status_walmart: entity.statusWalmart,
      str_num_load: entity.str.numLoad,
      str_complement_carta_porte: entity.str.complementCartaPorte,
      str_preinvoice_km: entity.str.preinvoiceKm,
      str_km_traveled: entity.str.kmTraveled,
      str_diesel: entity.str.diesel,
      str_casetas: entity.str.casetas,
      str_total_invoice: entity.str.totalInvoice,
      dhd_num_load: entity.dhd.numLoad,
      dhd_complement_carta_porte: entity.dhd.complementCartaPorte,
      dhd_preinvoice_km: entity.dhd.preinvoiceKm,
      dhd_km_traveled: entity.dhd.kmTraveled,
      dhd_diesel: entity.dhd.diesel,
      dhd_casetas: entity.dhd.casetas,
      dhd_total_invoice: entity.dhd.totalInvoice,
      dettes_log: JSON.stringify(entity.dettesLog),
      departure_temperature: entity.departureTemperature,
      departure_time: entity.departureTime?.toISOString() ?? null,
      num_stores: entity.numStores,
      incidencias: entity.incidencias,
    }
  }

  /**
   * Transforma un row de walmart_stores a la entidad de dominio.
   */
  static storeToDomain(row: WalmartStoreRow): WalmartStoreEntity {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      storeType: (row.store_type ?? 'AUTRE') as WalmartStoreType,
      storeCode: row.store_code,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    }
  }

  /**
   * Parsea de forma segura el campo dettes_log JSONB.
   */
  private static parseDettesLog(raw: unknown): DetteLogItem[] {
    if (!raw) return []
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!Array.isArray(parsed)) return []
      return parsed as DetteLogItem[]
    } catch {
      return []
    }
  }
}
