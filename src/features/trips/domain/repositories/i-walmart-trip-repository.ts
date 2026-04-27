/**
 * @fileoverview Interfaz del repositorio de datos específicos del cliente Walmart.
 * Define el contrato que SupabaseWalmartRepository debe implementar.
 * No importa nada de infrastructure (Clean Architecture - Domain Layer).
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type {
  WalmartTripDataEntity,
  WalmartTripDataInput,
  WalmartStoreEntity,
  DetteLogItem,
} from '../entities/walmart-trip-entity'

/**
 * Contrato del repositorio de datos Walmart por viaje.
 * Implementado por SupabaseWalmartRepository en infrastructure.
 */
export interface IWalmartTripRepository {
  /**
   * Obtiene los datos Walmart de un viaje específico.
   * @param tripId - UUID del viaje en trips
   */
  getByTripId(tripId: string): Promise<Either<Failure, WalmartTripDataEntity | null>>

  /**
   * Crea o actualiza los datos Walmart de un viaje.
   * Aplica upsert sobre walmart_trip_data y registra en trip_client_entries.
   * @param data - Datos Walmart del viaje
   */
  upsert(data: WalmartTripDataInput & { id?: string }): Promise<Either<Failure, WalmartTripDataEntity>>

  /**
   * Agrega una tienda DETTE al log del viaje.
   * Hace append al array dettes_log sin reemplazar los existentes.
   * @param tripId - UUID del viaje
   * @param dette - Item del log de tienda a agregar
   */
  addDetteToLog(tripId: string, dette: DetteLogItem): Promise<Either<Failure, WalmartTripDataEntity>>

  /**
   * Obtiene el catálogo de tiendas DETTE activas.
   */
  getStoresCatalog(): Promise<Either<Failure, WalmartStoreEntity[]>>

  /**
   * Obtiene el próximo número de viaje Walmart para el mes/año indicados.
   * (Visual — para mostrar al coordinador cuántos viajes van en el mes)
   * @param clientId - UUID del cliente Walmart
   * @param month - Mes (1-12)
   * @param year - Año
   */
  getNextTripNumberForMonth(
    clientId: string,
    month: number,
    year: number
  ): Promise<Either<Failure, number>>
}
