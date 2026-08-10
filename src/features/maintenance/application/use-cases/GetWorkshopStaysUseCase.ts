import type { Either, Failure } from '../../../../core/domain/either'
import type { WorkshopStayEntity } from '../../domain/entities/entities'
import type { IWorkshopStayRepository } from '../../domain/repositories/repositories'

/**
 * @fileoverview Caso de uso para obtener todas las estancias de taller.
 */

export async function GetWorkshopStaysUseCase(
  repository: IWorkshopStayRepository
): Promise<Either<Failure, WorkshopStayEntity[]>> {
  try {
    const stays = await repository.findAll()
    return { ok: true, data: stays }
  } catch (error: unknown) {
    const err = error as Error
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: err.message || 'Error al obtener estancias' }
    }
  }
}
