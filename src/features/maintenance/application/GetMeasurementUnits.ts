import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { MeasurementUnitEntity } from '../domain/entities/maintenance-entity'

/**
 * Caso de uso para obtener las unidades de medida.
 *
 * @param repo - Implementación del repositorio inyectada.
 * @returns Either con Failure o un listado de MeasurementUnitEntity.
 */
export async function GetMeasurementUnits(
  repo: IMaintenanceRepository
): Promise<Either<Failure, MeasurementUnitEntity[]>> {
  try {
    return await repo.getMeasurementUnits()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener unidades de medida' } }
  }
}
