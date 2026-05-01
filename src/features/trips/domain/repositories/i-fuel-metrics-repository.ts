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
   * Obtiene los inputs de métricas de un viaje (trip_fuel_metrics).
   * @param tripId - UUID del viaje
   */
  getByTripId(tripId: string): Promise<Either<Failure, FuelMetricsInputEntity | null>>

  /**
   * Crea o actualiza los inputs de métricas de un viaje.
   * @param tripId - UUID del viaje
   * @param data - Inputs a guardar (km, fechas, horas de termos)
   * @param createdBy - UUID del profile que realiza la operación
   */
  upsert(
    tripId: string,
    data: Partial<Omit<FuelMetricsInputEntity, 'id' | 'tripId' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
    createdBy: string
  ): Promise<Either<Failure, FuelMetricsInputEntity>>

  /**
   * Obtiene TODAS las cargas de combustible de un viaje (TRUCK + TRAILER).
   * Las cargas se ordenan por load_date ASC.
   * @param tripId - UUID del viaje
   */
  getFuelLoadsByTripId(tripId: string): Promise<Either<Failure, FuelLoadEntity[]>>

  /**
   * Registra una nueva carga de diésel.
   * Soporta cargas para el motor del tracto (TRUCK) y para el termo del remolque (TRAILER).
   * @param data - Datos de la carga (vehicle_type, truckId o trailerId, litros, etc.)
   * @param supervisedBy - UUID del profile del guardia/supervisor
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
