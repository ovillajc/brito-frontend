/**
 * @fileoverview Use Case: Actualizar una carga de diésel existente.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { FuelLoadEntity } from '../domain/entities/fuel-metrics-entity'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'

export async function UpdateFuelLoad(
  repo: IFuelMetricsRepository,
  id: string,
  data: Partial<Omit<FuelLoadEntity, 'id' | 'createdAt'>>
): Promise<Either<Failure, FuelLoadEntity>> {
  try {
    return await repo.updateFuelLoad(id, data)
  } catch (err) {
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: 'Error inesperado al actualizar la carga' },
    }
  }
}
