/**
 * @fileoverview Interfaz del repositorio de métricas de combustible.
 * Define el contrato que la capa de infrastructure debe implementar.
 * No importa nada de infrastructure (Clean Architecture - Domain Layer).
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type {
  FuelMetricsInputEntity,
  FuelLoadEntity,
  TruckYieldData,
  TrailerYieldData,
} from '../entities/fuel-metrics-entity'

/**
 * Contrato del repositorio de métricas de combustible.
 * Implementado por SupabaseFuelMetricsRepository en infrastructure.
 */
export interface IFuelMetricsRepository {
  /**
   * Obtiene los inputs de métricas de un viaje.
   * @param tripId - UUID del viaje
   */
  getByTripId(tripId: string): Promise<Either<Failure, FuelMetricsInputEntity | null>>

  /**
   * Crea o actualiza los inputs de métricas de un viaje.
   * @param tripId - UUID del viaje
   * @param data - Inputs a guardar (km, litros, horas)
   * @param createdBy - UUID del profile que realiza la operación
   */
  upsert(
    tripId: string,
    data: Partial<Omit<FuelMetricsInputEntity, 'id' | 'tripId' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
    createdBy: string
  ): Promise<Either<Failure, FuelMetricsInputEntity>>

  /**
   * Obtiene la carga de combustible principal de un viaje (tracto).
   * Incluye los campos de remolques (liters_r1, hours_r1, etc.)
   * @param tripId - UUID del viaje
   */
  getFuelLoadByTripId(tripId: string): Promise<Either<Failure, FuelLoadEntity | null>>

  /**
   * Registra una carga de diésel (acción del guardia/supervisor).
   * @param data - Datos de la carga
   * @param supervisedBy - UUID del profile del guardia
   */
  registerFuelLoad(
    data: Omit<FuelLoadEntity, 'id' | 'createdAt'>,
    supervisedBy: string
  ): Promise<Either<Failure, FuelLoadEntity>>

  /**
   * Obtiene los datos de rendimiento del tracto (tank_capacity, theoretical_yield).
   * @param truckId - UUID del tracto
   */
  getTruckYieldData(truckId: string): Promise<Either<Failure, TruckYieldData | null>>

  /**
   * Obtiene los datos de rendimiento de un remolque.
   * @param trailerId - UUID del remolque
   */
  getTrailerYieldData(trailerId: string): Promise<Either<Failure, TrailerYieldData | null>>
}
