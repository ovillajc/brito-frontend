/**
 * @fileoverview Use Case: Registrar carga de diésel.
 *
 * Soporta cargas para el MOTOR del tracto (vehicle_type = 'TRUCK')
 * y para el TERMO del remolque (vehicle_type = 'TRAILER').
 *
 * Reglas de negocio:
 * - Si vehicleType = 'TRUCK'  → truckId es requerido, trailerId debe ser null.
 * - Si vehicleType = 'TRAILER' → trailerId es requerido, truckId debe ser null.
 * - tripId puede ser null (carga sin viaje asignado: base o regreso).
 * - litersLoaded debe ser > 0.
 * - Para cargas EXTERNAL, pricePerLiter debe ser > 0.
 *
 * @param repo - Implementación inyectada de IFuelMetricsRepository
 * @param data - Datos de la carga de diésel
 * @param supervisedBy - UUID del profile del guardia
 * @param createdBy - UUID del profile que registra
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'
import type { FuelLoadEntity, FuelLoadVehicleType } from '../domain/entities/fuel-metrics-entity'

export interface RegisterFuelLoadInput {
  /** UUID del viaje. null = carga sin viaje asignado (regreso a base, etc.) */
  tripId: string | null
  /** Tipo de vehículo que recibe el combustible */
  vehicleType: FuelLoadVehicleType
  /** Requerido cuando vehicleType = 'TRUCK' */
  truckId: string | null
  /** Requerido cuando vehicleType = 'TRAILER' */
  trailerId: string | null
  operatorId: string | null
  ticketFolio: string
  ticketUrl?: string | null
  loadDate: Date
  litersLoaded: number
  pricePerLiter: number | null
  /** Odómetro del tracto o cuenta de horas del termo al momento de la carga */
  odometerAtLoad?: number | null
  isFullTankFill: boolean
  sourceType?: 'EXTERNAL' | 'INTERNAL_TANK'
  isBaseTankDepletedConfirmed?: boolean
}

export async function RegisterFuelLoad(
  repo: IFuelMetricsRepository,
  data: RegisterFuelLoadInput,
  supervisedBy: string,
  createdBy: string
): Promise<Either<Failure, FuelLoadEntity>> {
  // ── Validaciones de vehículo ─────────────────────────────────────────────
  if (data.vehicleType === 'TRUCK' && !data.truckId) {
    return { ok: false, error: { code: 'MISSING_TRUCK', message: 'El tracto es requerido para cargas de motor', statusCode: 400 } }
  }

  if (data.vehicleType === 'TRAILER' && !data.trailerId) {
    return { ok: false, error: { code: 'MISSING_TRAILER', message: 'El remolque es requerido para cargas de termo', statusCode: 400 } }
  }

  // ── Validaciones de litros ───────────────────────────────────────────────
  if (data.litersLoaded <= 0) {
    return { ok: false, error: { code: 'INVALID_LITERS', message: 'Los litros cargados deben ser mayores a 0', statusCode: 400 } }
  }

  // ── Validaciones de precio ───────────────────────────────────────────────
  const sourceType = data.sourceType ?? 'EXTERNAL'
  const pricePerLiter = data.pricePerLiter

  if (pricePerLiter == null || pricePerLiter <= 0) {
    return { ok: false, error: { code: 'INVALID_PRICE', message: 'El precio por litro debe ser mayor a 0', statusCode: 400 } }
  }

  // ── Validaciones de folio ────────────────────────────────────────────────
  if (!data.ticketFolio.trim()) {
    return { ok: false, error: { code: 'MISSING_FOLIO', message: 'El folio del ticket es obligatorio', statusCode: 400 } }
  }

  const totalCost = data.litersLoaded * pricePerLiter

  return repo.registerFuelLoad(
    {
      tripId: data.tripId,
      vehicleType: data.vehicleType,
      truckId: data.vehicleType === 'TRUCK' ? data.truckId : null,
      trailerId: data.vehicleType === 'TRAILER' ? data.trailerId : null,
      operatorId: data.operatorId,
      supervisedBy,
      supervisorName: null,
      loadDate: data.loadDate,
      ticketFolio: data.ticketFolio.trim(),
      ticketUrl: data.ticketUrl ?? null,
      litersLoaded: data.litersLoaded,
      pricePerLiter,
      totalCost,
      odometerAtLoad: data.odometerAtLoad ?? null,
      isFullTankFill: data.isFullTankFill,
      sourceType,
      isBaseTankDepleted: data.isBaseTankDepletedConfirmed ?? false,
      createdBy,
    },
    supervisedBy
  )
}
