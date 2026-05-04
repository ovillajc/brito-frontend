/**
 * @fileoverview Use Case: Eliminar una carga de diésel.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'

export async function DeleteFuelLoad(
  repo: IFuelMetricsRepository,
  id: string
): Promise<Either<Failure, void>> {
  try {
    return await repo.deleteFuelLoad(id)
  } catch (err) {
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: 'Error inesperado al eliminar la carga' },
    }
  }
}
